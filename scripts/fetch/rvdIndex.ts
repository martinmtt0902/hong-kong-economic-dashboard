import { fetchText } from "../lib/http";
import { parseOfficialPeriod } from "../lib/period";
import type { RawObservation, SourceRef } from "../lib/types";

export async function fetchRvdIndexObservations(
  url: string,
  source: SourceRef,
  seriesLabel: string,
  seriesKey: "price" | "rent"
): Promise<RawObservation[]> {
  const rawText = await fetchText(url);
  const rows = parseRvdIndexCsv(rawText);

  const points = rows
    .map((row): RawObservation | undefined => {
      const month = row.Month?.trim();
      const rawValue = row["All Classes"]?.trim();
      if (!month || !rawValue) {
        return undefined;
      }

      const value = Number(rawValue.replace(/,/g, ""));
      if (!Number.isFinite(value)) {
        return undefined;
      }

      const parsed = parseOfficialPeriod(month, "monthly");
      return {
        source,
        series_id: `rvd|${seriesKey}_index|all_classes`,
        series_label_tc: seriesLabel,
        frequency: "monthly",
        dimensions: { class: "All Classes" },
        measure_code: `${seriesKey.toUpperCase()}_INDEX`,
        measure_aliases: [`${seriesKey.toUpperCase()}_INDEX`],
        measure_label_tc: seriesLabel,
        period_raw: month,
        as_of_date: parsed.as_of_date,
        as_of_label: parsed.as_of_label,
        value,
        unit: "指數"
      } satisfies RawObservation;
    })
    .filter((point): point is RawObservation => Boolean(point))
    .sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));

  return points;
}

function parseRvdIndexCsv(text: string): Array<Record<string, string>> {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 3) {
    return [];
  }

  const headers = parseCsvLine(lines[1]).map((header) => header.trim());

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
