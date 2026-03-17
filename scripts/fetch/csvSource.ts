import { fetchText } from "../lib/http";
import type { DataPoint, Frequency } from "../lib/types";
import { numericValue, parsePeriod, sortPoints } from "../lib/time";
import { parseCsv } from "../lib/csv";

type CsvMetricConfig = {
  url: string;
  frequency: Frequency;
  unit: string;
  dateColumns?: string[];
  valueColumns?: string[];
  rowFilter?: (row: Record<string, string>) => boolean;
  valueSelector?: (row: Record<string, string>) => number | undefined;
  labelSelector?: (row: Record<string, string>) => string | undefined;
};

export async function fetchCsvSeries(config: CsvMetricConfig): Promise<DataPoint[]> {
  const rawText = await fetchText(config.url);

  const rows = parseCsv(rawText);

  const points = rows
    .filter((row) => (config.rowFilter ? config.rowFilter(row) : true))
    .map((row) => rowToPoint(row, config))
    .filter((point): point is DataPoint => Boolean(point));

  return dedupe(sortPoints(points));
}

function rowToPoint(
  row: Record<string, string>,
  config: CsvMetricConfig
): DataPoint | undefined {
  const dateValue =
    pickColumn(row, config.dateColumns) ??
    Object.values(row).find((value) => /\d{4}/.test(value));

  if (!dateValue) {
    return undefined;
  }

  const parsedPeriod = parsePeriod(dateValue, config.frequency);

  const value =
    config.valueSelector?.(row) ??
    numericValue(pickColumn(row, config.valueColumns)) ??
    firstNumericValue(row);

  if (typeof value !== "number") {
    return undefined;
  }

  return {
    period_key: parsedPeriod.period_key,
    label_tc: config.labelSelector?.(row) ?? parsedPeriod.label_tc,
    date: parsedPeriod.date,
    value,
    unit: config.unit
  };
}

function pickColumn(row: Record<string, string>, candidates: string[] = []): string | undefined {
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const match = entries.find(([header]) => header.toLowerCase().includes(candidate.toLowerCase()));
    if (match?.[1]) {
      return match[1];
    }
  }
  return undefined;
}

function firstNumericValue(row: Record<string, string>): number | undefined {
  for (const value of Object.values(row)) {
    const numeric = numericValue(value);
    if (typeof numeric === "number") {
      return numeric;
    }
  }
  return undefined;
}

function dedupe(points: DataPoint[]): DataPoint[] {
  return Array.from(new Map(points.map((point) => [point.period_key, point])).values());
}
