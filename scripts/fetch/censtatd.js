import { fetchJson } from "../lib/http";
import { numericValue, parsePeriod, sortPoints } from "../lib/time";
import { URLs } from "../lib/source";
export async function fetchCenstatdSeries(config) {
    const raw = await fetchJson(URLs.censtatd(config.tableId));
    const rows = raw.dataSet ?? [];
    const points = rows
        .filter((row) => Object.entries(config.filters).every(([key, value]) => String(row[key] ?? "") === String(value)))
        .map((row) => {
        const value = numericValue(row.figure);
        if (typeof value !== "number") {
            return undefined;
        }
        const period = parsePeriod(String(row.period ?? ""), config.frequency);
        return {
            period_key: period.period_key,
            label_tc: period.label_tc,
            date: period.date,
            value: value * (config.scale ?? 1),
            unit: config.unit
        };
    })
        .filter((point) => Boolean(point));
    return dedupePoints(sortPoints(points));
}
function dedupePoints(points) {
    const seen = new Map();
    points.forEach((point) => {
        seen.set(point.period_key, point);
    });
    return Array.from(seen.values());
}
