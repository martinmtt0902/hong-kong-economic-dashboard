import { fetchText } from "../lib/http";
import type { DataPoint } from "../lib/types";
import { numericValue, parsePeriod, sortPoints } from "../lib/time";

const completionHeaderPattern =
  /^(?<kind>Completions in|Forecast Completions in)\s+(?<year>\d{4})(?:\s*-\s*Total)?\s*$/i;

export async function fetchRvdCompletionsSeries(url: string): Promise<DataPoint[]> {
  const rawText = await fetchText(url);
  const rows = parseRvdCompletionsCsv(rawText);
  const overallRow = rows.find((row) => /overall/i.test(row["District"] ?? ""));

  if (!overallRow) {
    throw new Error("差餉物業估價署落成量 CSV 找不到 OVERALL 行。");
  }

  const points = Object.entries(overallRow)
    .map(([header, rawValue]) => {
      const match = header.trim().match(completionHeaderPattern);
      if (!match?.groups) {
        return undefined;
      }

      const value = numericValue(rawValue);
      if (typeof value !== "number") {
        return undefined;
      }

      const parsedPeriod = parsePeriod(match.groups.year, "annual");
      const isForecast = /forecast/i.test(match.groups.kind);

      const point: DataPoint = {
        period_key: parsedPeriod.period_key,
        label_tc: isForecast ? `${parsedPeriod.label_tc}（預測）` : parsedPeriod.label_tc,
        date: parsedPeriod.date,
        value,
        unit: "伙",
        provisional: isForecast
      };

      return point;
    })
    .filter((point): point is DataPoint => point !== undefined);

  return sortPoints(points);
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
