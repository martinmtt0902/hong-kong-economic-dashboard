import { fetchText } from "../lib/http";
import { parseCsv } from "../lib/csv";
import { parseOfficialPeriod } from "../lib/period";
import { numericValue } from "../lib/time";
import type { RawObservation, SourceRef } from "../lib/types";

type CsvObservationConfig = {
  source: SourceRef;
  series_id: string;
  series_label_tc: string;
  frequency: RawObservation["frequency"];
  unit: string;
  url: string;
  date_columns: string[];
  value_columns: string[];
  row_filter?: (row: Record<string, string>) => boolean;
  label_selector?: (row: Record<string, string>) => string | undefined;
};

export async function fetchCsvObservations(config: CsvObservationConfig): Promise<RawObservation[]> {
  const text = await fetchText(config.url);
  const rows = parseCsv(text);

  return rows
    .filter((row) => (config.row_filter ? config.row_filter(row) : true))
    .map((row) => {
      const rawPeriod = pickColumn(row, config.date_columns);
      const rawValue = pickColumn(row, config.value_columns);
      const numeric = numericValue(rawValue);
      if (!rawPeriod || typeof numeric !== "number") {
        return undefined;
      }

      const parsed = parseOfficialPeriod(rawPeriod, config.frequency);
      return {
        source: config.source,
        series_id: config.series_id,
        series_label_tc: config.series_label_tc,
        frequency: config.frequency,
        dimensions: {},
        measure_code: config.series_id,
        measure_aliases: [config.series_id],
        measure_label_tc: config.label_selector?.(row) ?? config.series_label_tc,
        period_raw: rawPeriod,
        as_of_date: parsed.as_of_date,
        as_of_label: parsed.as_of_label,
        value: numeric,
        unit: config.unit
      } satisfies RawObservation;
    })
    .filter((point): point is RawObservation => Boolean(point))
    .sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

function pickColumn(row: Record<string, string>, candidates: string[]): string | undefined {
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const match = entries.find(([header]) => header.toLowerCase().includes(candidate.toLowerCase()));
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}
