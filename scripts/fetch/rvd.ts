import { fetchText } from "../lib/http";
import { parseOfficialPeriod } from "../lib/period";
import type { RawObservation, SourceRef } from "../lib/types";

const completionHeaderPattern =
  /^(?<kind>Completions in|Forecast Completions in)\s+(?<year>\d{4})(?:\s*-\s*Total)?\s*$/i;

export async function fetchRvdCompletionsObservations(
  url: string,
  source: SourceRef,
  seriesLabel: string
): Promise<RawObservation[]> {
  const rawText = await fetchText(url);
  const rows = parseRvdCompletionsCsv(rawText);
  const overallRow = rows.find((row) => /overall/i.test(row["District"] ?? ""));

  if (!overallRow) {
    throw new Error("差餉物業估價署落成量 CSV 找不到 OVERALL 行。");
  }

  const points: RawObservation[] = [];
  for (const [header, rawValue] of Object.entries(overallRow)) {
    const match = header.trim().match(completionHeaderPattern);
    if (!match?.groups) {
      continue;
    }
    const value = Number(rawValue.replace(/,/g, "").trim());
    if (!Number.isFinite(value)) {
      continue;
    }

    const year = match.groups.year;
    const isForecast = /forecast/i.test(match.groups.kind);
    const parsed = parseOfficialPeriod(year, "annual");

    points.push({
      source,
      series_id: "rvd|private_domestic_completions|overall",
      series_label_tc: seriesLabel,
      frequency: "annual",
      dimensions: { district: "OVERALL" },
      measure_code: "PRIVATE_DOMESTIC_COMPLETIONS",
      measure_aliases: ["PRIVATE_DOMESTIC_COMPLETIONS"],
      measure_label_tc: isForecast ? "私人住宅落成量（預測）" : "私人住宅落成量",
      period_raw: year,
      as_of_date: parsed.as_of_date,
      as_of_label: isForecast ? `${parsed.as_of_label}（預測）` : parsed.as_of_label,
      value,
      unit: "伙",
      provisional: isForecast
    });
  }

  return points.sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

function parseRvdCompletionsCsv(text: string): Array<Record<string, string>> {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 3) {
    return [];
  }

  const headers = parseCsvLine(lines[1]).map((header, index) => header.trim() || `column_${index}`);

  return lines.slice(2).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index]?.trim() ?? "";
    });
    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}
