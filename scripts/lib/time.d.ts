import type { DataPoint, Frequency } from "./types";
export declare function numericValue(raw: string | number | undefined | null): number | undefined;
export declare function parsePeriod(raw: string, frequencyHint?: Frequency): {
    frequency: Frequency;
    period_key: string;
    label_tc: string;
    date: string;
};
export declare function sortPoints(points: DataPoint[]): DataPoint[];
