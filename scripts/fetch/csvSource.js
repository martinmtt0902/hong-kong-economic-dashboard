import { fetchText } from "../lib/http";
import { numericValue, parsePeriod, sortPoints } from "../lib/time";
import { parseCsv } from "../lib/csv";
export async function fetchCsvSeries(config) {
    const rawText = await fetchText(config.url);
    const rows = parseCsv(rawText);
    const points = rows
        .filter((row) => (config.rowFilter ? config.rowFilter(row) : true))
        .map((row) => rowToPoint(row, config))
        .filter((point) => Boolean(point));
    return dedupe(sortPoints(points));
}
function rowToPoint(row, config) {
    const dateValue = pickColumn(row, config.dateColumns) ??
        Object.values(row).find((value) => /\d{4}/.test(value));
    if (!dateValue) {
        return undefined;
    }
    const parsedPeriod = parsePeriod(dateValue, config.frequency);
    const value = config.valueSelector?.(row) ??
        numericValue(pickColumn(row, config.valueColumns)) ??
        firstNumericValue(row);
    if (typeof value !== "number") {
        return undefined;
    }
    return {
        period_key: parsedPeriod.period_key,
        label_tc: config.labelSelector?.(row) ?? parsedPeriod.label_tc,
        date: parsedPeriod.date,
        value,
        unit: config.unit
    };
}
function pickColumn(row, candidates = []) {
    const entries = Object.entries(row);
    for (const candidate of candidates) {
        const match = entries.find(([header]) => header.toLowerCase().includes(candidate.toLowerCase()));
        if (match?.[1]) {
            return match[1];
        }
    }
    return undefined;
}
function firstNumericValue(row) {
    for (const value of Object.values(row)) {
        const numeric = numericValue(value);
        if (typeof numeric === "number") {
            return numeric;
        }
    }
    return undefined;
}
function dedupe(points) {
    return Array.from(new Map(points.map((point) => [point.period_key, point])).values());
}
