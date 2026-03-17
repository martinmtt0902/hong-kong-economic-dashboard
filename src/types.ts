export type Frequency =
  | "daily"
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "annual"
  | "event";

export type FreshnessState = "fresh" | "stale" | "failed" | "empty";

export type DataPoint = {
  period_key: string;
  label_tc: string;
  date: string;
  value: number;
  unit: string;
  release_date?: string;
  provisional?: boolean;
};

export type MetricSeries = {
  id: string;
  label_tc: string;
  unit: string;
  frequency: Frequency;
  latest?: DataPoint;
  previous?: DataPoint;
  change_abs?: number;
  change_pct?: number;
  sparkline_points: DataPoint[];
  history_points: DataPoint[];
  source_name: string;
  source_url: string;
  source_note?: string;
  freshness: FreshnessState;
  stale_reason?: string;
  expected_update?: string;
};

export type DashboardCard = {
  id: string;
  title_tc: string;
  metrics: MetricSeries[];
  latest_data_at?: string;
  stale_reason?: string;
};

export type DashboardPayload = {
  generated_at: string;
  cards: DashboardCard[];
};

export type DashboardManifest = {
  generated_at: string;
  card_ids: string[];
  history_paths: Record<string, string>;
};
