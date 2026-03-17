import { sortPoints } from "./time";
export function buildMetricSeries(options) {
    const sorted = sortPoints(options.points);
    const latest = sorted.at(-1);
    const previous = sorted.length >= 2 ? sorted.at(-2) : undefined;
    const freshness = latest
        ? options.freshness ?? inferFreshness(latest.date, options.frequency)
        : options.fallback?.freshness ?? "empty";
    return {
        id: options.id,
        label_tc: options.label_tc,
        unit: options.unit,
        frequency: options.frequency,
        latest,
        previous,
        change_abs: latest && previous ? Number((latest.value - previous.value).toFixed(4)) : undefined,
        change_pct: latest && previous && previous.value !== 0
            ? Number((((latest.value - previous.value) / previous.value) * 100).toFixed(4))
            : undefined,
        sparkline_points: sorted.slice(-1 * (options.limit ?? defaultSparklineLength(options.frequency))),
        history_points: sorted,
        source_name: options.source_name,
        source_url: options.source_url,
        source_note: options.source_note,
        freshness,
        stale_reason: options.stale_reason,
        expected_update: options.expected_update
    };
}
export function createEmptyMetric(config, reason) {
    return {
        ...config,
        sparkline_points: [],
        history_points: [],
        freshness: "empty",
        stale_reason: reason
    };
}
export function fallbackMetric(config, previous, reason) {
    if (!previous) {
        return createEmptyMetric(config, reason);
    }
    return {
        ...previous,
        source_name: config.source_name,
        source_url: config.source_url,
        source_note: config.source_note,
        expected_update: config.expected_update,
        freshness: "failed",
        stale_reason: reason
    };
}
function defaultSparklineLength(frequency) {
    switch (frequency) {
        case "monthly":
            return 12;
        case "quarterly":
            return 8;
        case "annual":
            return 10;
        default:
            return 12;
    }
}
function inferFreshness(dateString, frequency) {
    const latestTime = new Date(dateString).getTime();
    if (Number.isNaN(latestTime)) {
        return "stale";
    }
    const ageInDays = (Date.now() - latestTime) / (1000 * 60 * 60 * 24);
    switch (frequency) {
        case "daily":
            return ageInDays > 5 ? "stale" : "fresh";
        case "monthly":
            return ageInDays > 62 ? "stale" : "fresh";
        case "quarterly":
            return ageInDays > 130 ? "stale" : "fresh";
        case "half_yearly":
            return ageInDays > 240 ? "stale" : "fresh";
        case "annual":
            return ageInDays > 550 ? "stale" : "fresh";
        case "event":
            return "fresh";
        default:
            return "fresh";
    }
}
