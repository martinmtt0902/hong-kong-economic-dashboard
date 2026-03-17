import type { DataPoint, Frequency } from "../lib/types";
type CsvMetricConfig = {
    url: string;
    frequency: Frequency;
    unit: string;
    dateColumns?: string[];
    valueColumns?: string[];
    rowFilter?: (row: Record<string, string>) => boolean;
    valueSelector?: (row: Record<string, string>) => number | undefined;
    labelSelector?: (row: Record<string, string>) => string | undefined;
};
export declare function fetchCsvSeries(config: CsvMetricConfig): Promise<DataPoint[]>;
export {};
