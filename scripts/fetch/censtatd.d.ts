import type { DataPoint, Frequency } from "../lib/types";
type CsdConfig = {
    tableId: string;
    filters: Record<string, string | number>;
    frequency: Frequency;
    unit: string;
    scale?: number;
};
export declare function fetchCenstatdSeries(config: CsdConfig): Promise<DataPoint[]>;
export {};
