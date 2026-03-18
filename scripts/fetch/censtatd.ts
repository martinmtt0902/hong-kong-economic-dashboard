import { fetchJson } from "../lib/http";
import { comparisonBasisLabel, formatRollingWindowLabel, parseOfficialPeriod, periodEndDateForRollingWindow } from "../lib/period";
import { URLs } from "../lib/source";
import { numericValue } from "../lib/time";
import type { MeasureSelector, RawObservation, SourceRef } from "../lib/types";

type CenstatdConfig = {
  source: SourceRef;
  table_id: string;
  series_label_tc: string;
  frequency: RawObservation["frequency"];
  dimensions: Record<string, string>;
  measure: MeasureSelector;
  scale?: number;
  period_mode?: "default" | "rolling_m3m";
};

type CsdResponse = {
  dataSet?: Array<Record<string, string | number>>;
};

export async function fetchCenstatdObservations(config: CenstatdConfig): Promise<RawObservation[]> {
  const raw = await fetchJson<CsdResponse>(URLs.censtatd(config.table_id));
  const rows = raw.dataSet ?? [];

  const points = rows
    .filter((row) => matchesDimensions(row, config.dimensions))
    .filter((row) => matchesMeasure(row, config.measure))
    .map((row) => toObservation(row, config))
    .filter((row): row is RawObservation => Boolean(row))
    .sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));

  return dedupe(points);
}

function matchesDimensions(row: Record<string, string | number>, dimensions: Record<string, string>): boolean {
  return Object.entries(dimensions).every(([key, value]) => String(row[key] ?? "") === value);
}

function matchesMeasure(row: Record<string, string | number>, measure: MeasureSelector): boolean {
  const code = String(row.sv ?? "");
  const label = String(row.svDesc ?? "");
  const codes = [measure.measure_code, ...(measure.measure_aliases ?? [])];
  if (!codes.includes(code)) {
    return false;
  }
  if (!measure.allowed_labels_tc || measure.allowed_labels_tc.length === 0) {
    return true;
  }
  return measure.allowed_labels_tc.includes(label);
}

function toObservation(
  row: Record<string, string | number>,
  config: CenstatdConfig
): RawObservation | undefined {
  const value = numericValue(row.figure as string | number | undefined);
  if (typeof value !== "number") {
    return undefined;
  }

  const rawPeriod = String(row.period ?? "");
  const parsed =
    config.period_mode === "rolling_m3m"
      ? {
          period_key: rawPeriod,
          as_of_date: periodEndDateForRollingWindow(rawPeriod),
          as_of_label: formatRollingWindowLabel(rawPeriod)
        }
      : parseOfficialPeriod(rawPeriod, config.frequency);

  const measureCode = String(row.sv ?? config.measure.measure_code);
  const measureLabel = String(row.svDesc ?? "");
  const scaledValue = value * (config.scale ?? 1);

  return {
    source: config.source,
    series_id: [
      "censtatd",
      config.table_id,
      ...Object.entries(config.dimensions).map(([key, val]) => `${key}=${val}`),
      `measure=${measureCode}`,
      `label=${measureLabel}`
    ].join("|"),
    series_label_tc: config.series_label_tc,
    frequency: config.frequency,
    dimensions: Object.fromEntries(
      Object.entries(row)
        .filter(([key]) => !["figure", "period", "sv", "svDesc", "unit"].includes(key))
        .map(([key, val]) => [key, String(val ?? "")])
    ),
    measure_code: measureCode,
    measure_aliases: config.measure.measure_aliases ?? [measureCode],
    measure_label_tc: measureLabel,
    period_raw: rawPeriod,
    as_of_date: parsed.as_of_date,
    as_of_label: parsed.as_of_label,
    release_date: extractReleaseDate(row),
    value: scaledValue,
    unit: normalizeUnit(config, measureLabel),
    provisional: extractProvisional(row)
  };
}

function extractReleaseDate(row: Record<string, string | number>): string | undefined {
  for (const key of ["releaseDate", "release_date", "reference_date"]) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return undefined;
}

function extractProvisional(row: Record<string, string | number>): boolean | undefined {
  for (const key of ["provisional", "revision", "revisionFlag"]) {
    const value = row[key];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      return /^(y|yes|true|1)$/i.test(value.trim());
    }
  }
  return undefined;
}

function normalizeUnit(config: CenstatdConfig, measureLabel: string): string {
  if (config.scale) {
    return config.scale === 1000 ? "人" : measureLabel;
  }
  if (measureLabel === "(%)" || measureLabel.includes("百分率")) {
    return "%";
  }
  return config.measure.allowed_labels_tc?.[0] ?? measureLabel;
}

function dedupe(points: RawObservation[]): RawObservation[] {
  const seen = new Map<string, RawObservation>();
  points.forEach((point) => {
    seen.set(point.as_of_date, point);
  });
  return Array.from(seen.values());
}
