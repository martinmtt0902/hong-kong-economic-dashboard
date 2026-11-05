import { fetchCenstatdObservations } from "./censtatd";
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

export async function fetchM3Observations(source: SourceRef, seriesLabel: string): Promise<RawObservation[]> {
  const records = await fetchHkmaMonetaryStatisticsRecords();
  const points: RawObservation[] = [];

  for (const record of records) {
    const rawDate = pickString(record, ["end_of_month"]);
    const rawValue = pickNumber(record, ["m3_total"]);
    if (!rawDate || rawDate.endsWith("-00") || typeof rawValue !== "number") {
      continue;
    }

    const parsed = parseOfficialPeriod(rawDate, "monthly");
    points.push({
      source,
      series_id: "hkma|m3_total",
      series_label_tc: seriesLabel,
      frequency: "monthly",
      dimensions: {},
      measure_code: "m3_total",
      measure_aliases: ["m3_total"],
      measure_label_tc: seriesLabel,
      period_raw: rawDate,
      as_of_date: parsed.as_of_date,
      as_of_label: parsed.as_of_label,
      value: rawValue,
      unit: "百萬港元"
    });
  }

  // HKMA's bulletin retains recent monthly rows plus annual rows. Keep the
  // monthly headline and comparison unchanged; recover older year-end M3
  // observations from C&SD's full official series (same all-currency stock).
  try {
    const annual = await fetchCenstatdObservations({
      source: { ...source, source_system: "censtatd_api", dataset_id: "hk-censtatd-tablechart-340-45011", dataset_url: URLs.m3Dataset, api_url: URLs.censtatd("340-45011"), table_id: "340-45011" },
      table_id: "340-45011", series_label_tc: seriesLabel, frequency: "annual",
      dimensions: { freq: "Y" },
      measure: { measure_code: "M3", measure_aliases: ["M3"], allowed_labels_tc: ["百萬港元"] }
    });
    const firstMonthly = points.map((point) => point.as_of_date).sort()[0];
    if (firstMonthly) points.push(...annual.filter((point) => point.as_of_date < firstMonthly));
  } catch {
    // A historical-source outage must not discard the live monthly series.
    // The chart's coverage text exposes the shorter available history.
  }

  return points.sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

async function fetchHkmaRecords(): Promise<Array<Record<string, unknown>>> {
  return fetchHkmaHistory(URLs.hkmaInterbankLiquidity, "end_of_date", 3);
}

async function fetchHkmaMonetaryStatisticsRecords(): Promise<Array<Record<string, unknown>>> {
  return fetchHkmaHistory(URLs.hkmaMonetaryStatistics, "end_of_month", 1);
}

// HKMA defaults to 100 rows and caps each page at 1,000. Three daily
// pages cover over seven calendar years; monthly history fits in one.
export async function fetchHkmaHistory(url: string, dateField: string, maxPages: number): Promise<Array<Record<string, unknown>>> {
  const records: Array<Record<string, unknown>> = [];
  for (let page = 0; page < maxPages; page += 1) {
    const query = new URL(url);
    query.search = new URLSearchParams({ pagesize: "1000", offset: String(page * 1000), sortby: dateField, sortorder: "desc" }).toString();
    const payload = await fetchJson<HkmaResponse>(query.toString());
    const batch = payload.result?.records ?? payload.records;
    if (!batch) throw new Error("HKMA response has no records");
    records.push(...batch);
    if (batch.length < 1000) break;
  }
  return records;
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
