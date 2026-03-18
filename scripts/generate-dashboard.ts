import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchCenstatdObservations } from "./fetch/censtatd";
import { fetchCsvObservations } from "./fetch/csvSource";
import { fetchBirthsRegistrationObservations, readBirthsRegistrationSnapshot } from "./fetch/birthsRegistration";
import { fetchBaseRateObservations, fetchHibor1MObservations } from "./fetch/hkma";
import { fetchMinimumWageObservations } from "./fetch/labour";
import { fetchRvdIndexObservations } from "./fetch/rvdIndex";
import { fetchRvdCompletionsObservations } from "./fetch/rvd";
import { metricDefinitions, type MetricDefinitionRecord, type MetricPipelineDefinition } from "./lib/metric-definition";
import { renderPreviewMarkdown } from "./lib/render-preview";
import { cardDefinitions } from "./lib/source";
import { buildTransformedMetric, latestCardMetric, selectCardHeaderMetric } from "./lib/transform";
import { toDashboardPayload, toUIMetricRow } from "./lib/ui-adapter";
import type {
  DashboardCardV2,
  DashboardManifest,
  DashboardPayloadV2,
  RawObservation,
  TransformedMetric
} from "./lib/types";
import {
  dashboardManifestSchema,
  dashboardPayloadSchema,
  dashboardPayloadV2Schema
} from "./lib/types";

const root = process.cwd();
const publicDataDir = path.join(root, "public", "data");
const historyDir = path.join(publicDataDir, "history");
const historyV2Dir = path.join(publicDataDir, "history-v2");
const reportsDir = path.join(root, "artifacts", "reports");
const rawDir = path.join(root, "artifacts", "raw");

export async function generateDashboardArtifacts() {
  const generatedAt = new Date().toISOString();
  const referenceDate = generatedAt.slice(0, 10);
  const previous = await loadPreviousDashboardV2();
  const previousMetrics = indexPreviousMetrics(previous);

  await mkdir(publicDataDir, { recursive: true });
  await mkdir(historyDir, { recursive: true });
  await mkdir(historyV2Dir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });
  await mkdir(rawDir, { recursive: true });

  const metricResults = await Promise.all(
    metricDefinitions.map((definition) => resolveMetric(definition, previousMetrics[definition.metric.id], generatedAt, referenceDate))
  );

  const cardsV2: DashboardCardV2[] = cardDefinitions.map((card) => {
    const metrics = metricResults
      .filter((result) => result.metric.card_id === card.id)
      .map((result) => result.metric);
    const latestMetric =
      card.header_mode === "latest_by_priority"
        ? selectCardHeaderMetric(metrics, card.header_metric_priority)
        : latestCardMetric(metrics);

    return {
      id: card.id,
      title_tc: card.title_tc,
      latest_as_of_date: latestMetric?.as_of_date,
      latest_as_of_label: latestMetric?.as_of_label,
      metrics
    };
  });

  const dashboardV2: DashboardPayloadV2 = {
    generated_at: generatedAt,
    cards: cardsV2
  };

  dashboardPayloadV2Schema.parse(dashboardV2);

  const uiDashboard = toDashboardPayload(dashboardV2);
  dashboardPayloadSchema.parse(uiDashboard);

  const manifest: DashboardManifest = {
    generated_at: generatedAt,
    card_ids: uiDashboard.cards.map((card) => card.id),
    history_paths: Object.fromEntries(uiDashboard.cards.map((card) => [card.id, `./history/${card.id}.json`])),
    history_v2_paths: Object.fromEntries(uiDashboard.cards.map((card) => [card.id, `./history-v2/${card.id}.json`]))
  };

  dashboardManifestSchema.parse(manifest);

  await writeJson(path.join(publicDataDir, "dashboard.v2.json"), dashboardV2);
  await writeJson(path.join(publicDataDir, "dashboard.json"), uiDashboard);
  await writeJson(path.join(publicDataDir, "manifest.json"), manifest);

  await Promise.all(
    uiDashboard.cards.map((card) => writeJson(path.join(historyDir, `${card.id}.json`), card))
  );
  await Promise.all(
    dashboardV2.cards.map((card) => writeJson(path.join(historyV2Dir, `${card.id}.json`), card))
  );

  const reportRows = metricResults.map((result) => ({
    metric_id: result.metric.id,
    raw_payload: {
      primary: result.primarySeries,
      auxiliary: result.auxiliarySeries
    },
    transformed_payload: result.metric,
    rendered_preview: toUIMetricRow(result.metric),
    comparison_type: result.metric.comparison_type,
    comparison_period_label: result.metric.comparison_period_label,
    display_unit: result.metric.display_unit,
    validation_state: result.metric.validation_state,
    chart_series_source: result.metric.chart_definition.series_id,
    chart_x_axis_label: result.metric.chart_definition.x_axis_label,
    chart_y_axis_label: result.metric.chart_definition.y_axis_label,
    chart_sample_ticks: result.metric.chart_definition.suggested_ticks,
    chart_tooltip_example: result.metric.chart_points[0]
      ? `${result.metric.chart_points[0].tooltip_title} | ${result.metric.chart_points[0].tooltip_value_text}`
      : null
  }));

  await writeJson(path.join(reportsDir, "raw-to-transformed.json"), reportRows);
  await writeFile(
    path.join(reportsDir, "render-preview.md"),
    renderPreviewMarkdown(dashboardV2, metricResults.map((result) => ({
      metric_id: result.metric.id,
      raw_count: result.primarySeries.length + result.auxiliarySeries.length,
      transformed_payload: result.metric,
      rendered_preview: toUIMetricRow(result.metric)
    }))),
    "utf-8"
  );

  const birthsAfter = reportRows.find((row) => row.metric_id === "live_births");
  const visitor = reportRows.find((row) => row.metric_id === "visitor_arrivals");
  await writeJson(path.join(reportsDir, "readability-pass.json"), {
    births_card_before: {
      raw_payload: {
        source: "衞生署已知活產嬰兒總數（男嬰 + 女嬰）",
        series_id: "dh|births|known_live_births_total",
        years: {
          2024: 36723,
          2023: 33232
        }
      },
      transformed_payload: {
        label_tc: "出生數",
        latest_value: 36723,
        previous_value: 33232
      },
      rendered_text: {
        headline: "36,723",
        comparison: "較上期（2023年） +3,491",
        previous: "上期（2023年） 33,232"
      }
    },
    births_card_after: birthsAfter
      ? {
          raw_payload: birthsAfter.raw_payload,
          transformed_payload: birthsAfter.transformed_payload,
          rendered_text: birthsAfter.rendered_preview
        }
      : null,
    visitor_arrivals_rounding_policy: visitor?.transformed_payload.rounding_policy ?? null
  });
}

async function resolveMetric(
  definition: MetricPipelineDefinition,
  previousMetric: TransformedMetric | undefined,
  generatedAt: string,
  referenceDate: string
) {
  try {
    let primarySeries = definition.metric.id === "live_births"
      ? readBirthsRegistrationSnapshot(definition.metric.source, definition.metric.series_label_tc)
      : await loadObservations(definition.metric);
    if (definition.metric.id === "live_births" && primarySeries.length === 0) {
      const birthsDefinition = definition.metric as Extract<MetricDefinitionRecord, { loader_kind: "births_registration" }>;
      primarySeries = await fetchBirthsRegistrationObservations(
        birthsDefinition.url,
        birthsDefinition.source,
        birthsDefinition.series_label_tc
      );
    }
    const auxiliarySeries = definition.auxiliary_series
      ? (await Promise.all(definition.auxiliary_series.map((item) => loadAuxiliaryObservations(item)))).flat()
      : [];

    await writeJson(path.join(rawDir, `${definition.metric.id}.json`), {
        metric_id: definition.metric.id,
        primary_series: primarySeries,
        auxiliary_series: auxiliarySeries
      });

    if (primarySeries.length === 0) {
      return {
        metric: fallbackMetric(
          definition.metric,
          previousMetric,
          "schema_changed",
          "來源欄位變更或找不到對應序列。",
          generatedAt
        ),
        primarySeries,
        auxiliarySeries
      };
    }

    const metric = {
      ...buildTransformedMetric({
      definition: definition.metric,
      primarySeries,
      auxiliarySeries,
      referenceDate
      }),
      last_successful_fetch_at: generatedAt
    };

    return {
      metric,
      primarySeries,
      auxiliarySeries
    };
  } catch (error) {
    return {
      metric: fallbackMetric(
        definition.metric,
        previousMetric,
        "source_error",
        error instanceof Error ? error.message : "未知抓取錯誤",
        generatedAt
      ),
      primarySeries: [],
      auxiliarySeries: []
    };
  }
}

async function loadObservations(definition: MetricDefinitionRecord): Promise<RawObservation[]> {
  switch (definition.loader_kind) {
    case "censtatd":
      return fetchCenstatdObservations({
        source: definition.source,
        table_id: definition.table_id,
        series_label_tc: definition.series_label_tc,
        frequency: definition.frequency,
        dimensions: definition.dimensions,
        measure: definition.measure,
        scale: definition.scale,
        period_mode: definition.period_mode
      });
    case "csv_long":
      return fetchCsvObservations({
        source: definition.source,
        series_id: definition.id,
        series_label_tc: definition.series_label_tc,
        frequency: definition.frequency,
        unit: definition.unit,
        url: definition.url,
        date_columns: definition.date_columns,
        value_columns: definition.value_columns,
        row_filter: definition.row_filter,
        label_selector: definition.label_selector
      });
    case "births_registration":
      return fetchBirthsRegistrationObservations(definition.url, definition.source, definition.series_label_tc);
    case "minimum_wage":
      return fetchMinimumWageObservations(definition.source, definition.series_label_tc);
    case "rvd_index":
      return fetchRvdIndexObservations(definition.url, definition.source, definition.series_label_tc, definition.series_key);
    case "hkma":
      return definition.metric_key === "base_rate"
        ? fetchBaseRateObservations(definition.source, definition.series_label_tc)
        : fetchHibor1MObservations(definition.source, definition.series_label_tc);
    case "rvd_completions":
      return fetchRvdCompletionsObservations(definition.url, definition.source, definition.series_label_tc);
    default:
      return [];
  }
}

async function loadAuxiliaryObservations(
  definition: NonNullable<MetricPipelineDefinition["auxiliary_series"]>[number]
): Promise<RawObservation[]> {
  return fetchCenstatdObservations({
    source: definition.source,
    table_id: definition.table_id,
    series_label_tc: definition.id,
    frequency: definition.frequency,
    dimensions: definition.dimensions,
    measure: definition.measure
  });
}

function fallbackMetric(
  definition: MetricDefinitionRecord,
  previousMetric: TransformedMetric | undefined,
  state: TransformedMetric["validation_state"],
  message: string,
  generatedAt: string
): TransformedMetric {
  if (previousMetric) {
    return {
      ...previousMetric,
      source: definition.source,
      validation_state: state,
      validation_messages: [{ code: state === "schema_changed" ? "schema_changed" : "source_missing", level: "error", message_tc: message }],
      expected_update: definition.expected_update,
      data_origin: state === "schema_changed" ? "last_verified_snapshot" : "last_successful_snapshot",
      last_successful_fetch_at: previousMetric.last_successful_fetch_at ?? previousMetric.as_of_date,
      last_verified_value: previousMetric.latest_value,
      last_verified_period: previousMetric.as_of_label,
      reason: state === "schema_changed" ? "source schema changed" : message
    };
  }

  return {
    id: definition.id,
    card_id: definition.card_id,
    label_tc: definition.label_tc,
    source: definition.source,
    series_id: definition.id,
    metric_type: definition.metric_type,
    frequency: definition.frequency,
    unit: definition.unit,
    display_unit: definition.display_unit ?? definition.unit,
    rounding_policy: definition.rounding_policy ?? {
      value_decimals: 0,
      change_decimals: 0,
      previous_decimals: 0
    },
    as_of_date: "",
    as_of_label: "",
    change_type: definition.change_type,
    comparison_type: definition.comparison_basis,
    comparison_basis: definition.comparison_basis,
    comparison_basis_label_tc: definition.comparison_basis_label_tc,
    data_origin: "status_only",
    reason: state === "schema_changed" ? "source schema changed" : message,
    chart_definition: {
      series_id: definition.id,
      metric_type: definition.sparkline_metric_type ?? definition.metric_type,
      chart_type: definition.chart_type ?? "line",
      frequency: definition.frequency,
      unit: definition.unit,
      display_unit: definition.display_unit ?? definition.unit,
      period_start: "",
      period_end: "",
      x_axis_label: definition.chart_time_label ?? "期間",
      y_axis_label: `${definition.chart_value_label ?? definition.label_tc} (${definition.display_unit ?? definition.unit})`,
      value_label: definition.chart_value_label ?? definition.label_tc,
      time_label: definition.chart_time_label ?? "期間",
      suggested_ticks: []
    },
    chart_points: [],
    sparkline_definition: {
      series_id: definition.id,
      metric_type: definition.sparkline_metric_type ?? definition.metric_type,
      comparison_basis: definition.comparison_basis,
      unit: definition.unit,
      frequency: definition.frequency
    },
    sparkline_points: [],
    validation_state: state,
    validation_messages: [{ code: state === "schema_changed" ? "schema_changed" : "source_missing", level: "error", message_tc: message }],
    source_note: definition.source_note,
    expected_update: definition.expected_update
  };
}

async function loadPreviousDashboardV2(): Promise<DashboardPayloadV2 | null> {
  try {
    const raw = await readFile(path.join(publicDataDir, "dashboard.v2.json"), "utf-8");
    return dashboardPayloadV2Schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function indexPreviousMetrics(payload: DashboardPayloadV2 | null): Record<string, TransformedMetric> {
  if (!payload) {
    return {};
  }
  return Object.fromEntries(payload.cards.flatMap((card) => card.metrics.map((metric) => [metric.id, metric])));
}

async function writeJson(filePath: string, payload: unknown) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

generateDashboardArtifacts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
