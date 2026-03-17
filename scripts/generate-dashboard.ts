import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchCenstatdSeries } from "./fetch/censtatd";
import { fetchCsvSeries } from "./fetch/csvSource";
import { fetchBaseRateSeries, fetchHibor1MSeries } from "./fetch/hkma";
import { fetchMinimumWageSeries } from "./fetch/labour";
import { fetchRvdCompletionsSeries } from "./fetch/rvd";
import { cardDefinitions, metricConfigs, URLs } from "./lib/source";
import { buildMetricSeries, fallbackMetric } from "./lib/series";
import { createSeedPayload } from "./lib/seed";
import type { DashboardCard, DashboardManifest, DashboardPayload, DataPoint, MetricSeries } from "./lib/types";
import { dashboardManifestSchema, dashboardPayloadSchema } from "./lib/types";

const root = process.cwd();
const publicDataDir = path.join(root, "public", "data");
const historyDir = path.join(publicDataDir, "history");
const artifactsDir = path.join(root, "artifacts", "raw");

async function main() {
  const generatedAt = new Date().toISOString();
  const previous = await loadPreviousDashboard();
  const previousMetrics = indexPreviousMetrics(previous);

  await mkdir(publicDataDir, { recursive: true });
  await mkdir(historyDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });

  const cards = await Promise.all(
    cardDefinitions.map(async (card) => {
      const metrics = await resolveCardMetrics(card.id, previousMetrics);
      return {
        id: card.id,
        title_tc: card.title_tc,
        metrics,
        latest_data_at: latestMetricDate(metrics),
        latest_data_label: latestMetricLabel(metrics)
      } satisfies DashboardCard;
    })
  );

  const dashboard: DashboardPayload =
    cards.some((card) => card.metrics.some((metric) => metric.latest))
      ? { generated_at: generatedAt, cards }
      : createSeedPayload(generatedAt);

  dashboardPayloadSchema.parse(dashboard);

  const manifest: DashboardManifest = {
    generated_at: generatedAt,
    card_ids: dashboard.cards.map((card) => card.id),
    history_paths: Object.fromEntries(
      dashboard.cards.map((card) => [card.id, `./history/${card.id}.json`])
    )
  };

  dashboardManifestSchema.parse(manifest);

  await writeFile(
    path.join(publicDataDir, "dashboard.json"),
    `${JSON.stringify(dashboard, null, 2)}\n`,
    "utf-8"
  );
  await writeFile(
    path.join(publicDataDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf-8"
  );

  await Promise.all(
    dashboard.cards.map((card) =>
      writeFile(
        path.join(historyDir, `${card.id}.json`),
        `${JSON.stringify(card, null, 2)}\n`,
        "utf-8"
      )
    )
  );
}

async function resolveCardMetrics(
  cardId: string,
  previousMetrics: Record<string, MetricSeries>
): Promise<MetricSeries[]> {
  switch (cardId) {
    case "employment":
      return Promise.all([
        resolveMetric("unemployment", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "210-06101",
            filters: { SEX: "", freq: "M3M", sv: "UR" },
            frequency: "monthly",
            unit: "%"
          })
        ),
        resolveMetric("underemployment", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "210-06101",
            filters: { SEX: "", freq: "M3M", sv: "UDR" },
            frequency: "monthly",
            unit: "%"
          })
        ),
        resolveMetric("labour_force", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "210-06101",
            filters: { SEX: "", freq: "M3M", sv: "LF" },
            frequency: "monthly",
            unit: "人",
            scale: 1000
          })
        )
      ]);
    case "inflation":
      return [
        await resolveDerivedMetric("cpi_yoy", previousMetrics, async () => {
          const baseSeries = await fetchCenstatdSeries({
            tableId: "510-60001A",
            filters: { GROUP: "", freq: "M", sv: "CC_CM_1920" },
            frequency: "monthly",
            unit: "指數"
          });
          return deriveYearOnYear(baseSeries, "%", 12);
        })
      ];
    case "gdp":
      return Promise.all([
        resolveDerivedMetric("gdp_real_yoy", previousMetrics, async () => {
          const series = await fetchCenstatdSeries({
            tableId: "310-31003",
            filters: { GDP_COMPONENT: "", freq: "Q", sv: "CON" },
            frequency: "quarterly",
            unit: "百萬港元"
          });
          return deriveYearOnYear(series, "%", 4);
        }),
        resolveDerivedMetric("gdp_nominal_yoy", previousMetrics, async () => {
          const series = await fetchCenstatdSeries({
            tableId: "310-31002",
            filters: { GDP_COMPONENT: "", freq: "Q", sv: "CUR" },
            frequency: "quarterly",
            unit: "百萬港元"
          });
          return deriveYearOnYear(series, "%", 4);
        })
      ]);
    case "consumption-travel":
      return Promise.all([
        resolveMetric("retail_sales", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "620-67001",
            filters: { freq: "M", sv: "VAL_RS" },
            frequency: "monthly",
            unit: "百萬港元"
          })
        ),
        resolveMetric("visitor_arrivals", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "650-80001",
            filters: { REGION: "", freq: "M", sv: "VIS_ARR" },
            frequency: "monthly",
            unit: "人次"
          })
        )
      ]);
    case "minimum-wage":
      return [await resolveMetric("statutory_minimum_wage", previousMetrics, fetchMinimumWageSeries)];
    case "population":
      return Promise.all([
        resolveMetric("population_total", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "110-01002",
            filters: { SEX: "", AGE: "", freq: "H", sv: "POP", svDesc: "數目 ('000)" },
            frequency: "half_yearly",
            unit: "人",
            scale: 1000
          })
        ),
        resolveMetric("live_births", previousMetrics, async () =>
          fetchCsvSeries({
            url: URLs.birthsCsv,
            frequency: "annual",
            unit: "人",
            dateColumns: ["年份", "year"],
            valueColumns: ["總數", "number of births", "活產總數", "出生總數"]
          })
        ),
        resolveMetric("median_age", previousMetrics, async () =>
          fetchCenstatdSeries({
            tableId: "110-01004",
            filters: { SEX: "", freq: "Y", sv: "MED_AGE_POPN" },
            frequency: "annual",
            unit: "歲"
          })
        )
      ]);
    case "housing":
      return Promise.all([
        resolveMetric("private_price_index", previousMetrics, async () =>
          fetchCsvSeries({
            url: URLs.rvdPriceCsv,
            frequency: "monthly",
            unit: "指數",
            dateColumns: ["date", "month", "月份"],
            valueColumns: ["all classes", "overall", "所有類別", "private domestic"]
          })
        ),
        resolveMetric("private_rent_index", previousMetrics, async () =>
          fetchCsvSeries({
            url: URLs.rvdRentCsv,
            frequency: "monthly",
            unit: "指數",
            dateColumns: ["date", "month", "月份"],
            valueColumns: ["all classes", "overall", "所有類別", "private domestic"]
          })
        ),
        resolveMetric("private_completions", previousMetrics, async () =>
          fetchRvdCompletionsSeries(URLs.rvdCompletionsCsv)
        )
      ]);
    case "fiscal":
      return Promise.all([
        resolveMetric("government_revenue", previousMetrics, async () =>
          fetchCsvSeries({
            url: URLs.fstbOverviewCsv,
            frequency: "annual",
            unit: "百萬港元",
            dateColumns: ["財政年度"],
            valueColumns: ["政府收入總額"],
            labelSelector: (row) => row["財政年度"]
          })
        ),
        resolveMetric("government_expenditure", previousMetrics, async () =>
          fetchCsvSeries({
            url: URLs.fstbOverviewCsv,
            frequency: "annual",
            unit: "百萬港元",
            dateColumns: ["財政年度"],
            valueColumns: ["政府開支總額"],
            labelSelector: (row) => row["財政年度"]
          })
        ),
        resolveMetric("fiscal_reserves", previousMetrics, async () =>
          fetchCsvSeries({
            url: URLs.fstbOverviewCsv,
            frequency: "annual",
            unit: "百萬港元",
            dateColumns: ["財政年度"],
            valueColumns: ["年終財政儲備"],
            labelSelector: (row) => row["財政年度"]
          })
        )
      ]);
    case "interest-rates":
      return Promise.all([
        resolveMetric("base_rate", previousMetrics, fetchBaseRateSeries),
        resolveMetric("hibor_1m", previousMetrics, fetchHibor1MSeries)
      ]);
    default:
      return [];
  }
}

async function resolveMetric(
  metricId: keyof typeof metricConfigs,
  previousMetrics: Record<string, MetricSeries>,
  loader: () => Promise<DataPoint[]>
): Promise<MetricSeries> {
  const config = metricConfigs[metricId];
  try {
    const points = await loader();
    await saveRawSnapshot(metricId, points);
    if (points.length === 0) {
      return fallbackMetric(config, previousMetrics[metricId], "來源暫時沒有可用數據。");
    }
    return buildMetricSeries({
      ...config,
      points,
      freshness: "fresh"
    });
  } catch (error) {
    return fallbackMetric(
      config,
      previousMetrics[metricId],
      error instanceof Error ? error.message : "未知抓取錯誤"
    );
  }
}

async function resolveDerivedMetric(
  metricId: keyof typeof metricConfigs,
  previousMetrics: Record<string, MetricSeries>,
  loader: () => Promise<DataPoint[]>
): Promise<MetricSeries> {
  return resolveMetric(metricId, previousMetrics, loader);
}

function deriveYearOnYear(series: DataPoint[], unit: string, lookback: number): DataPoint[] {
  const derived = series.map((point, index) => {
      const previousYear = series[index - lookback];
      if (!previousYear || previousYear.value === 0) {
        return undefined;
      }

      const nextPoint: DataPoint = {
        period_key: point.period_key,
        label_tc: point.label_tc,
        date: point.date,
        value: Number((((point.value - previousYear.value) / previousYear.value) * 100).toFixed(4)),
        unit
      };

      if (point.release_date) {
        nextPoint.release_date = point.release_date;
      }

      if (typeof point.provisional === "boolean") {
        nextPoint.provisional = point.provisional;
      }

      return nextPoint;
    });

  return derived.filter((point): point is DataPoint => point !== undefined);
}

function latestMetricDate(metrics: MetricSeries[]): string | undefined {
  return pickCardLatestPoint(metrics)?.date;
}

function latestMetricLabel(metrics: MetricSeries[]): string | undefined {
  return pickCardLatestPoint(metrics)?.label_tc;
}

function pickCardLatestPoint(metrics: MetricSeries[]): DataPoint | undefined {
  return metrics
    .filter((metric): metric is MetricSeries & { latest: DataPoint } => Boolean(metric.latest))
    .sort((left, right) => {
      const dateOrder = left.latest.date.localeCompare(right.latest.date);
      if (dateOrder !== 0) {
        return dateOrder;
      }
      return frequencyRank(left.frequency) - frequencyRank(right.frequency);
    })
    .at(-1)?.latest;
}

function frequencyRank(frequency: MetricSeries["frequency"]): number {
  switch (frequency) {
    case "daily":
      return 6;
    case "monthly":
      return 5;
    case "quarterly":
      return 4;
    case "half_yearly":
      return 3;
    case "annual":
      return 2;
    case "event":
      return 1;
    default:
      return 0;
  }
}

async function loadPreviousDashboard(): Promise<DashboardPayload | null> {
  try {
    const raw = await readFile(path.join(publicDataDir, "dashboard.json"), "utf-8");
    return dashboardPayloadSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function indexPreviousMetrics(payload: DashboardPayload | null): Record<string, MetricSeries> {
  if (!payload) {
    return {};
  }

  return Object.fromEntries(
    payload.cards.flatMap((card) => card.metrics.map((metric) => [metric.id, metric]))
  );
}

async function saveRawSnapshot(metricId: string, payload: unknown): Promise<void> {
  await writeFile(
    path.join(artifactsDir, `${metricId}.json`),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf-8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
