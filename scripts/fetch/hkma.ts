import { fetchJson } from "../lib/http";
import type { DataPoint } from "../lib/types";
import { numericValue, parsePeriod, sortPoints } from "../lib/time";
import { URLs } from "../lib/source";

type HkmaResponse = {
  result?: {
    records?: Array<Record<string, unknown>>;
  };
  records?: Array<Record<string, unknown>>;
};

export async function fetchBaseRateSeries(): Promise<DataPoint[]> {
  const payload = await fetchJson<HkmaResponse>(URLs.hkmaInterbankLiquidity);
  const records = payload.result?.records ?? payload.records ?? [];

  return sortPoints(
    records
      .map((record) => {
        const rawDate =
          pickString(record, ["end_of_date", "end_of_day", "date", "end_of_month"]) ??
          pickAnyDate(record);
        const rawValue = pickNumber(record, ["disc_win_base_rate", "base_rate"]);
        if (!rawDate || typeof rawValue !== "number") {
          return undefined;
        }
        const parsed = parsePeriod(rawDate, "daily");
        return {
          period_key: parsed.period_key,
          label_tc: parsed.label_tc,
          date: parsed.date,
          value: rawValue,
          unit: "%"
        } satisfies DataPoint;
      })
      .filter((point): point is DataPoint => Boolean(point))
  );
}

export async function fetchHibor1MSeries(): Promise<DataPoint[]> {
  const payload = await fetchJson<HkmaResponse>(URLs.hkmaInterbankLiquidity);
  const records = payload.result?.records ?? payload.records ?? [];

  return sortPoints(
    records
      .map((record) => {
        const rawDate =
          pickString(record, ["end_of_date", "end_of_day", "date", "end_of_month"]) ??
          pickAnyDate(record);
        const rawValue = pickNumber(record, ["hibor_fixing_1m", "ir_1m", "1_month", "one_month"]);
        if (!rawDate || typeof rawValue !== "number") {
          return undefined;
        }
        const parsed = parsePeriod(rawDate, "daily");
        return {
          period_key: parsed.period_key,
          label_tc: parsed.label_tc,
          date: parsed.date,
          value: rawValue,
          unit: "%"
        } satisfies DataPoint;
      })
      .filter((point): point is DataPoint => Boolean(point))
  );
}

function pickString(
  record: Record<string, unknown>,
  candidates: string[]
): string | undefined {
  for (const candidate of candidates) {
    const entry = Object.entries(record).find(([key]) =>
      key.toLowerCase().includes(candidate.toLowerCase())
    );
    if (typeof entry?.[1] === "string") {
      return entry[1];
    }
  }
  return undefined;
}

function pickAnyDate(record: Record<string, unknown>): string | undefined {
  return Object.values(record).find(
    (value): value is string => typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value)
  );
}

function pickNumber(
  record: Record<string, unknown>,
  candidates: string[]
): number | undefined {
  for (const candidate of candidates) {
    const entry = Object.entries(record).find(([key]) =>
      key.toLowerCase().includes(candidate.toLowerCase())
    );
    const parsed = numericValue(
      typeof entry?.[1] === "number" ? entry[1] : typeof entry?.[1] === "string" ? entry[1] : ""
    );
    if (typeof parsed === "number") {
      return parsed;
    }
  }

  for (const value of Object.values(record)) {
    const parsed = numericValue(typeof value === "string" || typeof value === "number" ? value : "");
    if (typeof parsed === "number") {
      return parsed;
    }
  }

  return undefined;
}
