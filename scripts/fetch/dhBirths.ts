import { fetchText } from "../lib/http";
import { parseOfficialPeriod } from "../lib/period";
import { parseCsv } from "../lib/csv";
import { numericValue } from "../lib/time";
import type { RawObservation, SourceRef } from "../lib/types";

export async function fetchDhBirthObservations(url: string, source: SourceRef, seriesLabel: string): Promise<RawObservation[]> {
  const text = await fetchText(url);
  const rows = parseCsv(text);

  const points: RawObservation[] = [];
  for (const row of rows) {
    const year = row["年份"];
    const male = numericValue(row["所知男嬰出生人數"]);
    const female = numericValue(row["所知女嬰出生人數"]);
    if (!year || typeof male !== "number" || typeof female !== "number") {
      continue;
    }
    const parsed = parseOfficialPeriod(year, "annual");
    points.push({
      source,
      series_id: "dh|births|known_live_births_total",
      series_label_tc: seriesLabel,
      frequency: "annual",
      dimensions: {},
      measure_code: "KNOWN_LIVE_BIRTHS_TOTAL",
      measure_aliases: ["KNOWN_LIVE_BIRTHS_TOTAL", "male+female"],
      measure_label_tc: "活產嬰兒總數",
      period_raw: year,
      as_of_date: parsed.as_of_date,
      as_of_label: parsed.as_of_label,
      value: male + female,
      unit: "人"
    });
  }

  return points.sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}
