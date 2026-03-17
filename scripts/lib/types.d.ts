import { z } from "zod";
export declare const frequencySchema: z.ZodEnum<["daily", "monthly", "quarterly", "half_yearly", "annual", "event"]>;
export declare const freshnessSchema: z.ZodEnum<["fresh", "stale", "failed", "empty"]>;
export declare const dataPointSchema: z.ZodObject<{
    period_key: z.ZodString;
    label_tc: z.ZodString;
    date: z.ZodString;
    value: z.ZodNumber;
    unit: z.ZodString;
    release_date: z.ZodOptional<z.ZodString>;
    provisional: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    period_key: string;
    label_tc: string;
    date: string;
    value: number;
    unit: string;
    release_date?: string | undefined;
    provisional?: boolean | undefined;
}, {
    period_key: string;
    label_tc: string;
    date: string;
    value: number;
    unit: string;
    release_date?: string | undefined;
    provisional?: boolean | undefined;
}>;
export declare const metricSeriesSchema: z.ZodObject<{
    id: z.ZodString;
    label_tc: z.ZodString;
    unit: z.ZodString;
    frequency: z.ZodEnum<["daily", "monthly", "quarterly", "half_yearly", "annual", "event"]>;
    latest: z.ZodOptional<z.ZodObject<{
        period_key: z.ZodString;
        label_tc: z.ZodString;
        date: z.ZodString;
        value: z.ZodNumber;
        unit: z.ZodString;
        release_date: z.ZodOptional<z.ZodString>;
        provisional: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }>>;
    previous: z.ZodOptional<z.ZodObject<{
        period_key: z.ZodString;
        label_tc: z.ZodString;
        date: z.ZodString;
        value: z.ZodNumber;
        unit: z.ZodString;
        release_date: z.ZodOptional<z.ZodString>;
        provisional: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }>>;
    change_abs: z.ZodOptional<z.ZodNumber>;
    change_pct: z.ZodOptional<z.ZodNumber>;
    sparkline_points: z.ZodArray<z.ZodObject<{
        period_key: z.ZodString;
        label_tc: z.ZodString;
        date: z.ZodString;
        value: z.ZodNumber;
        unit: z.ZodString;
        release_date: z.ZodOptional<z.ZodString>;
        provisional: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }>, "many">;
    history_points: z.ZodArray<z.ZodObject<{
        period_key: z.ZodString;
        label_tc: z.ZodString;
        date: z.ZodString;
        value: z.ZodNumber;
        unit: z.ZodString;
        release_date: z.ZodOptional<z.ZodString>;
        provisional: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }, {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }>, "many">;
    source_name: z.ZodString;
    source_url: z.ZodString;
    source_note: z.ZodOptional<z.ZodString>;
    freshness: z.ZodEnum<["fresh", "stale", "failed", "empty"]>;
    stale_reason: z.ZodOptional<z.ZodString>;
    expected_update: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    label_tc: string;
    unit: string;
    id: string;
    frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
    sparkline_points: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }[];
    history_points: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }[];
    source_name: string;
    source_url: string;
    freshness: "fresh" | "stale" | "failed" | "empty";
    latest?: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    } | undefined;
    previous?: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    } | undefined;
    change_abs?: number | undefined;
    change_pct?: number | undefined;
    source_note?: string | undefined;
    stale_reason?: string | undefined;
    expected_update?: string | undefined;
}, {
    label_tc: string;
    unit: string;
    id: string;
    frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
    sparkline_points: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }[];
    history_points: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    }[];
    source_name: string;
    source_url: string;
    freshness: "fresh" | "stale" | "failed" | "empty";
    latest?: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    } | undefined;
    previous?: {
        period_key: string;
        label_tc: string;
        date: string;
        value: number;
        unit: string;
        release_date?: string | undefined;
        provisional?: boolean | undefined;
    } | undefined;
    change_abs?: number | undefined;
    change_pct?: number | undefined;
    source_note?: string | undefined;
    stale_reason?: string | undefined;
    expected_update?: string | undefined;
}>;
export declare const dashboardCardSchema: z.ZodObject<{
    id: z.ZodString;
    title_tc: z.ZodString;
    metrics: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label_tc: z.ZodString;
        unit: z.ZodString;
        frequency: z.ZodEnum<["daily", "monthly", "quarterly", "half_yearly", "annual", "event"]>;
        latest: z.ZodOptional<z.ZodObject<{
            period_key: z.ZodString;
            label_tc: z.ZodString;
            date: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            release_date: z.ZodOptional<z.ZodString>;
            provisional: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }>>;
        previous: z.ZodOptional<z.ZodObject<{
            period_key: z.ZodString;
            label_tc: z.ZodString;
            date: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            release_date: z.ZodOptional<z.ZodString>;
            provisional: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }>>;
        change_abs: z.ZodOptional<z.ZodNumber>;
        change_pct: z.ZodOptional<z.ZodNumber>;
        sparkline_points: z.ZodArray<z.ZodObject<{
            period_key: z.ZodString;
            label_tc: z.ZodString;
            date: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            release_date: z.ZodOptional<z.ZodString>;
            provisional: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }>, "many">;
        history_points: z.ZodArray<z.ZodObject<{
            period_key: z.ZodString;
            label_tc: z.ZodString;
            date: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            release_date: z.ZodOptional<z.ZodString>;
            provisional: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }, {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }>, "many">;
        source_name: z.ZodString;
        source_url: z.ZodString;
        source_note: z.ZodOptional<z.ZodString>;
        freshness: z.ZodEnum<["fresh", "stale", "failed", "empty"]>;
        stale_reason: z.ZodOptional<z.ZodString>;
        expected_update: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label_tc: string;
        unit: string;
        id: string;
        frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
        sparkline_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        history_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        source_name: string;
        source_url: string;
        freshness: "fresh" | "stale" | "failed" | "empty";
        latest?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        previous?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        change_abs?: number | undefined;
        change_pct?: number | undefined;
        source_note?: string | undefined;
        stale_reason?: string | undefined;
        expected_update?: string | undefined;
    }, {
        label_tc: string;
        unit: string;
        id: string;
        frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
        sparkline_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        history_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        source_name: string;
        source_url: string;
        freshness: "fresh" | "stale" | "failed" | "empty";
        latest?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        previous?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        change_abs?: number | undefined;
        change_pct?: number | undefined;
        source_note?: string | undefined;
        stale_reason?: string | undefined;
        expected_update?: string | undefined;
    }>, "many">;
    latest_data_at: z.ZodOptional<z.ZodString>;
    stale_reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title_tc: string;
    metrics: {
        label_tc: string;
        unit: string;
        id: string;
        frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
        sparkline_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        history_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        source_name: string;
        source_url: string;
        freshness: "fresh" | "stale" | "failed" | "empty";
        latest?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        previous?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        change_abs?: number | undefined;
        change_pct?: number | undefined;
        source_note?: string | undefined;
        stale_reason?: string | undefined;
        expected_update?: string | undefined;
    }[];
    stale_reason?: string | undefined;
    latest_data_at?: string | undefined;
}, {
    id: string;
    title_tc: string;
    metrics: {
        label_tc: string;
        unit: string;
        id: string;
        frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
        sparkline_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        history_points: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        }[];
        source_name: string;
        source_url: string;
        freshness: "fresh" | "stale" | "failed" | "empty";
        latest?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        previous?: {
            period_key: string;
            label_tc: string;
            date: string;
            value: number;
            unit: string;
            release_date?: string | undefined;
            provisional?: boolean | undefined;
        } | undefined;
        change_abs?: number | undefined;
        change_pct?: number | undefined;
        source_note?: string | undefined;
        stale_reason?: string | undefined;
        expected_update?: string | undefined;
    }[];
    stale_reason?: string | undefined;
    latest_data_at?: string | undefined;
}>;
export declare const dashboardPayloadSchema: z.ZodObject<{
    generated_at: z.ZodString;
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title_tc: z.ZodString;
        metrics: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label_tc: z.ZodString;
            unit: z.ZodString;
            frequency: z.ZodEnum<["daily", "monthly", "quarterly", "half_yearly", "annual", "event"]>;
            latest: z.ZodOptional<z.ZodObject<{
                period_key: z.ZodString;
                label_tc: z.ZodString;
                date: z.ZodString;
                value: z.ZodNumber;
                unit: z.ZodString;
                release_date: z.ZodOptional<z.ZodString>;
                provisional: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }>>;
            previous: z.ZodOptional<z.ZodObject<{
                period_key: z.ZodString;
                label_tc: z.ZodString;
                date: z.ZodString;
                value: z.ZodNumber;
                unit: z.ZodString;
                release_date: z.ZodOptional<z.ZodString>;
                provisional: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }>>;
            change_abs: z.ZodOptional<z.ZodNumber>;
            change_pct: z.ZodOptional<z.ZodNumber>;
            sparkline_points: z.ZodArray<z.ZodObject<{
                period_key: z.ZodString;
                label_tc: z.ZodString;
                date: z.ZodString;
                value: z.ZodNumber;
                unit: z.ZodString;
                release_date: z.ZodOptional<z.ZodString>;
                provisional: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }>, "many">;
            history_points: z.ZodArray<z.ZodObject<{
                period_key: z.ZodString;
                label_tc: z.ZodString;
                date: z.ZodString;
                value: z.ZodNumber;
                unit: z.ZodString;
                release_date: z.ZodOptional<z.ZodString>;
                provisional: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }, {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }>, "many">;
            source_name: z.ZodString;
            source_url: z.ZodString;
            source_note: z.ZodOptional<z.ZodString>;
            freshness: z.ZodEnum<["fresh", "stale", "failed", "empty"]>;
            stale_reason: z.ZodOptional<z.ZodString>;
            expected_update: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            label_tc: string;
            unit: string;
            id: string;
            frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
            sparkline_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            history_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            source_name: string;
            source_url: string;
            freshness: "fresh" | "stale" | "failed" | "empty";
            latest?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            previous?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            change_abs?: number | undefined;
            change_pct?: number | undefined;
            source_note?: string | undefined;
            stale_reason?: string | undefined;
            expected_update?: string | undefined;
        }, {
            label_tc: string;
            unit: string;
            id: string;
            frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
            sparkline_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            history_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            source_name: string;
            source_url: string;
            freshness: "fresh" | "stale" | "failed" | "empty";
            latest?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            previous?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            change_abs?: number | undefined;
            change_pct?: number | undefined;
            source_note?: string | undefined;
            stale_reason?: string | undefined;
            expected_update?: string | undefined;
        }>, "many">;
        latest_data_at: z.ZodOptional<z.ZodString>;
        stale_reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title_tc: string;
        metrics: {
            label_tc: string;
            unit: string;
            id: string;
            frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
            sparkline_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            history_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            source_name: string;
            source_url: string;
            freshness: "fresh" | "stale" | "failed" | "empty";
            latest?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            previous?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            change_abs?: number | undefined;
            change_pct?: number | undefined;
            source_note?: string | undefined;
            stale_reason?: string | undefined;
            expected_update?: string | undefined;
        }[];
        stale_reason?: string | undefined;
        latest_data_at?: string | undefined;
    }, {
        id: string;
        title_tc: string;
        metrics: {
            label_tc: string;
            unit: string;
            id: string;
            frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
            sparkline_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            history_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            source_name: string;
            source_url: string;
            freshness: "fresh" | "stale" | "failed" | "empty";
            latest?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            previous?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            change_abs?: number | undefined;
            change_pct?: number | undefined;
            source_note?: string | undefined;
            stale_reason?: string | undefined;
            expected_update?: string | undefined;
        }[];
        stale_reason?: string | undefined;
        latest_data_at?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    generated_at: string;
    cards: {
        id: string;
        title_tc: string;
        metrics: {
            label_tc: string;
            unit: string;
            id: string;
            frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
            sparkline_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            history_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            source_name: string;
            source_url: string;
            freshness: "fresh" | "stale" | "failed" | "empty";
            latest?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            previous?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            change_abs?: number | undefined;
            change_pct?: number | undefined;
            source_note?: string | undefined;
            stale_reason?: string | undefined;
            expected_update?: string | undefined;
        }[];
        stale_reason?: string | undefined;
        latest_data_at?: string | undefined;
    }[];
}, {
    generated_at: string;
    cards: {
        id: string;
        title_tc: string;
        metrics: {
            label_tc: string;
            unit: string;
            id: string;
            frequency: "daily" | "monthly" | "quarterly" | "half_yearly" | "annual" | "event";
            sparkline_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            history_points: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            }[];
            source_name: string;
            source_url: string;
            freshness: "fresh" | "stale" | "failed" | "empty";
            latest?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            previous?: {
                period_key: string;
                label_tc: string;
                date: string;
                value: number;
                unit: string;
                release_date?: string | undefined;
                provisional?: boolean | undefined;
            } | undefined;
            change_abs?: number | undefined;
            change_pct?: number | undefined;
            source_note?: string | undefined;
            stale_reason?: string | undefined;
            expected_update?: string | undefined;
        }[];
        stale_reason?: string | undefined;
        latest_data_at?: string | undefined;
    }[];
}>;
export declare const dashboardManifestSchema: z.ZodObject<{
    generated_at: z.ZodString;
    card_ids: z.ZodArray<z.ZodString, "many">;
    history_paths: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    generated_at: string;
    card_ids: string[];
    history_paths: Record<string, string>;
}, {
    generated_at: string;
    card_ids: string[];
    history_paths: Record<string, string>;
}>;
export type Frequency = z.infer<typeof frequencySchema>;
export type FreshnessState = z.infer<typeof freshnessSchema>;
export type DataPoint = z.infer<typeof dataPointSchema>;
export type MetricSeries = z.infer<typeof metricSeriesSchema>;
export type DashboardCard = z.infer<typeof dashboardCardSchema>;
export type DashboardPayload = z.infer<typeof dashboardPayloadSchema>;
export type DashboardManifest = z.infer<typeof dashboardManifestSchema>;
export type MetricBaseConfig = {
    id: string;
    cardId: string;
    label_tc: string;
    unit: string;
    frequency: Frequency;
    source_name: string;
    source_url: string;
    source_note?: string;
    expected_update?: string;
};
