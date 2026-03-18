import { z } from "zod";

export const frequencySchema = z.enum([
  "daily",
  "monthly",
  "quarterly",
  "half_yearly",
  "annual",
  "event"
]);

export const metricTypeSchema = z.enum([
  "level",
  "yoy_percent",
  "qoq_percent",
  "absolute_change",
  "percentage_point_change"
]);

export const changeTypeSchema = z.enum([
  "none",
  "yoy_percent",
  "qoq_percent",
  "absolute_change",
  "percentage_point_change"
]);

export const comparisonBasisSchema = z.enum([
  "previous_observation",
  "same_period_last_year",
  "previous_rolling_window",
  "event_previous_effective"
]);

export const validationStateSchema = z.enum([
  "ok",
  "data_error",
  "needs_review",
  "schema_changed",
  "source_error",
  "stale"
]);

export const validationMessageCodeSchema = z.enum([
  "value_out_of_range",
  "year_used_as_value",
  "double_yoy_detected",
  "measure_mismatch",
  "schema_changed",
  "source_missing",
  "comparison_missing"
]);

export const sourceRefSchema = z.object({
  publisher: z.string(),
  dataset_id: z.string().optional(),
  dataset_url: z.string().url(),
  api_url: z.string().url().optional(),
  table_id: z.string().optional()
});

export const rawObservationSchema = z.object({
  source: sourceRefSchema,
  series_id: z.string(),
  series_label_tc: z.string(),
  frequency: frequencySchema,
  dimensions: z.record(z.string(), z.string()),
  measure_code: z.string(),
  measure_aliases: z.array(z.string()),
  measure_label_tc: z.string(),
  period_raw: z.string(),
  as_of_date: z.string(),
  as_of_label: z.string(),
  release_date: z.string().optional(),
  effective_date: z.string().optional(),
  value: z.number(),
  unit: z.string(),
  provisional: z.boolean().optional()
});

export const sparklineDefinitionSchema = z.object({
  series_id: z.string(),
  metric_type: metricTypeSchema,
  comparison_basis: comparisonBasisSchema,
  unit: z.string(),
  frequency: frequencySchema
});

export const sparklinePointSchema = z.object({
  as_of_date: z.string(),
  as_of_label: z.string(),
  value: z.number()
});

export const validationMessageSchema = z.object({
  code: validationMessageCodeSchema,
  level: z.enum(["error", "warning"]),
  message_tc: z.string()
});

export const transformedMetricSchema = z.object({
  id: z.string(),
  card_id: z.string(),
  label_tc: z.string(),
  source: sourceRefSchema,
  series_id: z.string(),
  auxiliary_series_ids: z.array(z.string()).optional(),
  metric_type: metricTypeSchema,
  frequency: frequencySchema,
  unit: z.string(),
  as_of_date: z.string(),
  as_of_label: z.string(),
  release_date: z.string().optional(),
  latest_value: z.number().optional(),
  previous_value: z.number().optional(),
  previous_as_of_date: z.string().optional(),
  previous_as_of_label: z.string().optional(),
  change_value: z.number().optional(),
  change_type: changeTypeSchema,
  comparison_basis: comparisonBasisSchema,
  comparison_basis_label_tc: z.string(),
  sparkline_definition: sparklineDefinitionSchema,
  sparkline_points: z.array(sparklinePointSchema),
  validation_state: validationStateSchema,
  validation_messages: z.array(validationMessageSchema),
  source_note: z.string().optional(),
  expected_update: z.string().optional(),
  provisional: z.boolean().optional()
});

export const dashboardCardV2Schema = z.object({
  id: z.string(),
  title_tc: z.string(),
  latest_as_of_date: z.string().optional(),
  latest_as_of_label: z.string().optional(),
  metrics: z.array(transformedMetricSchema)
});

export const dashboardPayloadV2Schema = z.object({
  generated_at: z.string(),
  cards: z.array(dashboardCardV2Schema)
});

export const uiSparklinePointSchema = z.object({
  x: z.string(),
  y: z.number()
});

export const uiMetricRowSchema = z.object({
  id: z.string(),
  label_tc: z.string(),
  source_name: z.string(),
  source_url: z.string().url(),
  source_note: z.string().optional(),
  status: validationStateSchema,
  status_text_tc: z.string(),
  display_value_text: z.string(),
  display_change_text: z.string(),
  display_previous_text: z.string(),
  display_period_text: z.string(),
  display_comparison_basis_text: z.string(),
  sparkline_points: z.array(uiSparklinePointSchema),
  expected_update: z.string().optional()
});

export const dashboardCardSchema = z.object({
  id: z.string(),
  title_tc: z.string(),
  latest_data_at: z.string().optional(),
  latest_data_label: z.string().optional(),
  card_status_text_tc: z.string().optional(),
  metrics: z.array(uiMetricRowSchema)
});

export const dashboardPayloadSchema = z.object({
  generated_at: z.string(),
  cards: z.array(dashboardCardSchema)
});

export const dashboardManifestSchema = z.object({
  generated_at: z.string(),
  card_ids: z.array(z.string()),
  history_paths: z.record(z.string(), z.string()),
  history_v2_paths: z.record(z.string(), z.string()).optional()
});

export type Frequency = z.infer<typeof frequencySchema>;
export type MetricType = z.infer<typeof metricTypeSchema>;
export type ChangeType = z.infer<typeof changeTypeSchema>;
export type ComparisonBasis = z.infer<typeof comparisonBasisSchema>;
export type ValidationState = z.infer<typeof validationStateSchema>;
export type ValidationMessageCode = z.infer<typeof validationMessageCodeSchema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type RawObservation = z.infer<typeof rawObservationSchema>;
export type SparklineDefinition = z.infer<typeof sparklineDefinitionSchema>;
export type SparklinePoint = z.infer<typeof sparklinePointSchema>;
export type ValidationMessage = z.infer<typeof validationMessageSchema>;
export type TransformedMetric = z.infer<typeof transformedMetricSchema>;
export type DashboardCardV2 = z.infer<typeof dashboardCardV2Schema>;
export type DashboardPayloadV2 = z.infer<typeof dashboardPayloadV2Schema>;
export type UIMetricRow = z.infer<typeof uiMetricRowSchema>;
export type DashboardCard = z.infer<typeof dashboardCardSchema>;
export type DashboardPayload = z.infer<typeof dashboardPayloadSchema>;
export type DashboardManifest = z.infer<typeof dashboardManifestSchema>;

export type MeasureSelector = {
  measure_code: string;
  measure_aliases?: string[];
  allowed_labels_tc?: string[];
};

export type MetricDefinition = {
  id: string;
  card_id: string;
  label_tc: string;
  source: SourceRef;
  frequency: Frequency;
  unit: string;
  metric_type: MetricType;
  change_type: ChangeType;
  comparison_basis: ComparisonBasis;
  comparison_basis_label_tc: string;
  source_note?: string;
  expected_update?: string;
  sparkline_metric_type?: MetricType;
  sparkline_series_role?: "primary" | "auxiliary";
  validation?: {
    min?: number;
    max?: number;
    disallow_year_value?: boolean;
    disallow_three_digit?: boolean;
    compare_auxiliary_delta_max?: number;
  };
};
