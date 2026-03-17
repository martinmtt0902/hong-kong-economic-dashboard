import type { DataPoint, MetricBaseConfig, MetricSeries } from "./types";
type BuildMetricOptions = MetricBaseConfig & {
    points: DataPoint[];
    limit?: number;
    fallback?: MetricSeries;
    freshness?: MetricSeries["freshness"];
    stale_reason?: string;
};
export declare function buildMetricSeries(options: BuildMetricOptions): MetricSeries;
export declare function createEmptyMetric(config: MetricBaseConfig, reason: string): MetricSeries;
export declare function fallbackMetric(config: MetricBaseConfig, previous: MetricSeries | undefined, reason: string): MetricSeries;
export {};
