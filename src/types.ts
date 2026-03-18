export type Frequency =
  | "daily"
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "annual"
  | "event";

export type MetricStatus =
  | "ok"
  | "data_error"
  | "needs_review"
  | "schema_changed"
  | "source_error"
  | "stale";

export type UISparklinePoint = {
  x: string;
  y: number;
};

export type UIMetricRow = {
  id: string;
  label_tc: string;
  source_name: string;
  source_url: string;
  source_note?: string;
  status: MetricStatus;
  status_text_tc: string;
  display_value_text: string;
  display_change_text: string;
  display_previous_text: string;
  display_period_text: string;
  display_comparison_basis_text: string;
  sparkline_points: UISparklinePoint[];
  expected_update?: string;
};

export type DashboardCard = {
  id: string;
  title_tc: string;
  metrics: UIMetricRow[];
  latest_data_at?: string;
  latest_data_label?: string;
  card_status_text_tc?: string;
};

export type DashboardPayload = {
  generated_at: string;
  cards: DashboardCard[];
};

export type DashboardManifest = {
  generated_at: string;
  card_ids: string[];
  history_paths: Record<string, string>;
  history_v2_paths?: Record<string, string>;
};
