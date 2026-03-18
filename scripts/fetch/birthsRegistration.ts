import { readFileSync } from "node:fs";
import path from "node:path";
import { fetchText } from "../lib/http";
import { parseCsv } from "../lib/csv";
import { parseOfficialPeriod } from "../lib/period";
import { numericValue } from "../lib/time";
import type { RawObservation, SourceRef } from "../lib/types";

export async function fetchBirthsRegistrationObservations(
  url: string,
  source: SourceRef,
  seriesLabel: string
): Promise<RawObservation[]> {
  const rows = parseCsv(await fetchRegistrationSource(url));
  const points = rowsToObservations(rows, source, seriesLabel);
  return points.length > 0 ? points : readBirthsRegistrationSnapshot(source, seriesLabel);
}

export function readBirthsRegistrationSnapshot(source: SourceRef, seriesLabel: string): RawObservation[] {
  const rows = parseCsv(readFileSync(path.join(process.cwd(), "scripts", "fetch", "fixtures", "births_registration_snapshot.csv"), "utf-8"));
  return rowsToObservations(rows, source, seriesLabel);
}

function rowsToObservations(rows: Array<Record<string, string>>, source: SourceRef, seriesLabel: string): RawObservation[] {
  const points: RawObservation[] = [];
  for (const row of rows) {
    const year = pickColumn(row, ["年份", "Year"]);
    const total = pickColumn(row, ["出生登記總數", "Births", "Total Births", "No. of Births", "Registered Births"]);
    const numeric = numericValue(total);
    if (!year || typeof numeric !== "number") {
      continue;
    }

    const parsed = parseOfficialPeriod(year, "annual");
    points.push({
      source,
      series_id: "immd|births_registration|total",
      series_label_tc: seriesLabel,
      frequency: "annual",
      dimensions: {},
      measure_code: "REGISTERED_BIRTHS_TOTAL",
      measure_aliases: ["REGISTERED_BIRTHS_TOTAL", "Births"],
      measure_label_tc: "出生登記總數",
      period_raw: year,
      as_of_date: parsed.as_of_date,
      as_of_label: parsed.as_of_label,
      value: numeric,
      unit: "人"
    });
  }

  return points.sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

async function fetchRegistrationSource(url: string): Promise<string> {
  try {
    return await fetchText(url);
  } catch {
    return "";
  }
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
