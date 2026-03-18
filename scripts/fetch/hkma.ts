import { fetchJson } from "../lib/http";
import { parseOfficialPeriod } from "../lib/period";
import { numericValue } from "../lib/time";
import type { RawObservation, SourceRef } from "../lib/types";
import { URLs } from "../lib/source";

type HkmaResponse = {
  result?: {
    records?: Array<Record<string, unknown>>;
  };
  records?: Array<Record<string, unknown>>;
};

export async function fetchBaseRateObservations(source: SourceRef, seriesLabel: string): Promise<RawObservation[]> {
  const records = await fetchHkmaRecords();
  return toObservations(records, source, seriesLabel, "hkma|base_rate", ["disc_win_base_rate", "base_rate"]);
}

export async function fetchHibor1MObservations(source: SourceRef, seriesLabel: string): Promise<RawObservation[]> {
  const records = await fetchHkmaRecords();
  return toObservations(records, source, seriesLabel, "hkma|hibor_1m", [
    "hibor_fixing_1m",
    "ir_1m",
    "1_month",
    "one_month"
  ]);
}

async function fetchHkmaRecords(): Promise<Array<Record<string, unknown>>> {
  const payload = await fetchJson<HkmaResponse>(URLs.hkmaInterbankLiquidity);
  return payload.result?.records ?? payload.records ?? [];
}

function toObservations(
  records: Array<Record<string, unknown>>,
  source: SourceRef,
  seriesLabel: string,
  seriesId: string,
  valueKeys: string[]
): RawObservation[] {
  const points: RawObservation[] = [];
  for (const record of records) {
    const rawDate = pickString(record, ["end_of_date", "end_of_day", "date", "end_of_month"]);
    const rawValue = pickNumber(record, valueKeys);
    if (!rawDate || typeof rawValue !== "number") {
      continue;
    }
    const parsed = parseOfficialPeriod(rawDate, "daily");
    points.push({
      source,
      series_id: seriesId,
      series_label_tc: seriesLabel,
      frequency: "daily",
      dimensions: {},
      measure_code: seriesId,
      measure_aliases: [seriesId],
      measure_label_tc: seriesLabel,
      period_raw: rawDate,
      as_of_date: parsed.as_of_date,
      as_of_label: parsed.as_of_label,
      value: rawValue,
      unit: "%"
    });
  }

  return points.sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

function pickString(record: Record<string, unknown>, candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const entry = Object.entries(record).find(([key]) => key.toLowerCase().includes(candidate.toLowerCase()));
    if (typeof entry?.[1] === "string") {
      return entry[1];
    }
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, candidates: string[]): number | undefined {
  for (const candidate of candidates) {
    const entry = Object.entries(record).find(([key]) => key.toLowerCase().includes(candidate.toLowerCase()));
    const parsed = numericValue(
      typeof entry?.[1] === "number" ? entry[1] : typeof entry?.[1] === "string" ? entry[1] : ""
    );
    if (typeof parsed === "number") {
      return parsed;
    }
  }
  return undefined;
}
