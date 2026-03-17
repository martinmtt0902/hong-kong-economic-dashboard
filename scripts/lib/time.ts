import type { DataPoint, Frequency } from "./types";

const quarterPattern = /(?<year>\d{4})(?:.*?Q(?<quarterQ>[1-4])|.*?第?(?<quarterC>[1-4])季)/i;
const monthPattern =
  /(?<year>\d{4})[-/年.](?<month>\d{1,2})(?:[-/月.]|$)|(?<monthText>[A-Za-z]{3})[- ](?<yearText>\d{2,4})/;
const yearPattern = /(?<!\d)(?<year>\d{4})(?!\d)/;

const monthMap: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
};

export function numericValue(raw: string | number | undefined | null): number | undefined {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : undefined;
  }

  if (!raw) {
    return undefined;
  }

  const cleaned = raw.replace(/,/g, "").replace(/%/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned.toLowerCase() === "na") {
    return undefined;
  }

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

export function parsePeriod(raw: string, frequencyHint?: Frequency) {
  const text = raw.trim();
  const parsedDate = new Date(text);

  if (frequencyHint === "daily" && !Number.isNaN(parsedDate.getTime())) {
    return {
      frequency: "daily" as const,
      period_key: text.slice(0, 10),
      label_tc: text.slice(0, 10),
      date: parsedDate.toISOString()
    };
  }

  if (frequencyHint === "quarterly" || quarterPattern.test(text)) {
    const match = text.match(quarterPattern);
    if (match?.groups) {
      const year = Number(match.groups.year);
      const quarter = Number(match.groups.quarterQ ?? match.groups.quarterC);
      return {
        frequency: "quarterly" as const,
        period_key: `${year}-Q${quarter}`,
        label_tc: `${year}年第${quarter}季`,
        date: new Date(Date.UTC(year, quarter * 3 - 1, 1)).toISOString()
      };
    }
  }

  if (frequencyHint === "half_yearly" && /^\d{6}$/.test(text)) {
    const year = Number(text.slice(0, 4));
    const month = Number(text.slice(4, 6));
    return {
      frequency: "half_yearly" as const,
      period_key: `${year}-${String(month).padStart(2, "0")}`,
      label_tc: month === 6 ? `${year}年年中` : `${year}年年底`,
      date: new Date(Date.UTC(year, month - 1, 1)).toISOString()
    };
  }

  if ((frequencyHint === "monthly" || frequencyHint === "daily") && /^\d{6}$/.test(text)) {
    const year = Number(text.slice(0, 4));
    const month = Number(text.slice(4, 6));
    return {
      frequency: "monthly" as const,
      period_key: `${year}-${String(month).padStart(2, "0")}`,
      label_tc: `${year}年${month}月`,
      date: new Date(Date.UTC(year, month - 1, 1)).toISOString()
    };
  }

  if (frequencyHint === "monthly" || monthPattern.test(text)) {
    const match = text.match(monthPattern);
    if (match?.groups) {
      const rawYear = match.groups.year ?? match.groups.yearText;
      const year =
        rawYear.length === 2 ? (Number(rawYear) >= 70 ? 1900 + Number(rawYear) : 2000 + Number(rawYear)) : Number(rawYear);
      const month =
        Number(match.groups.month) ||
        monthMap[(match.groups.monthText ?? "").slice(0, 3)] ||
        1;
      return {
        frequency: "monthly" as const,
        period_key: `${year}-${String(month).padStart(2, "0")}`,
        label_tc: `${year}年${month}月`,
        date: new Date(Date.UTC(year, month - 1, 1)).toISOString()
      };
    }
  }

  if (frequencyHint === "annual" || yearPattern.test(text)) {
    const match = text.match(yearPattern);
    if (match?.groups) {
      const year = Number(match.groups.year);
      return {
        frequency: "annual" as const,
        period_key: `${year}`,
        label_tc: `${year}年`,
        date: new Date(Date.UTC(year, 0, 1)).toISOString()
      };
    }
  }

  if (!Number.isNaN(parsedDate.getTime())) {
    return {
      frequency: (frequencyHint ?? "event") as Frequency,
      period_key: text,
      label_tc: text,
      date: parsedDate.toISOString()
    };
  }

  return {
    frequency: (frequencyHint ?? "event") as Frequency,
    period_key: text,
    label_tc: text,
    date: new Date().toISOString()
  };
}

export function sortPoints(points: DataPoint[]): DataPoint[] {
  return [...points].sort((left, right) => left.date.localeCompare(right.date));
}
