import { fetchJson } from "../lib/http";
import type { DataPoint, Frequency } from "../lib/types";
import { numericValue, parsePeriod, sortPoints } from "../lib/time";
import { URLs } from "../lib/source";

type CsdConfig = {
  tableId: string;
  filters: Record<string, string | number>;
  frequency: Frequency;
  unit: string;
  scale?: number;
};

export async function fetchCenstatdSeries(config: CsdConfig): Promise<DataPoint[]> {
  const raw = await fetchJson<{ dataSet?: Array<Record<string, string | number>> }>(
    URLs.censtatd(config.tableId)
  );
  const rows = raw.dataSet ?? [];

  const points = rows
    .filter((row) =>
      Object.entries(config.filters).every(([key, value]) => String(row[key] ?? "") === String(value))
    )
    .map((row) => {
      const value = numericValue(row.figure as string | number | undefined);
      if (typeof value !== "number") {
        return undefined;
      }

      const period = parsePeriod(String(row.period ?? ""), config.frequency);
      return {
        period_key: period.period_key,
        label_tc: period.label_tc,
        date: period.date,
        value: value * (config.scale ?? 1),
        unit: config.unit
      } satisfies DataPoint;
    })
    .filter((point): point is DataPoint => Boolean(point));

  return dedupePoints(sortPoints(points));
}

function dedupePoints(points: DataPoint[]): DataPoint[] {
  const seen = new Map<string, DataPoint>();
  points.forEach((point) => {
    seen.set(point.period_key, point);
  });
  return Array.from(seen.values());
}
