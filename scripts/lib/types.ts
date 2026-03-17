import { z } from "zod";

export const frequencySchema = z.enum([
  "daily",
  "monthly",
  "quarterly",
  "half_yearly",
  "annual",
  "event"
]);

export const freshnessSchema = z.enum(["fresh", "stale", "failed", "empty"]);

export const dataPointSchema = z.object({
  period_key: z.string(),
  label_tc: z.string(),
  date: z.string(),
  value: z.number(),
  unit: z.string(),
  release_date: z.string().optional(),
  provisional: z.boolean().optional()
});

export const metricSeriesSchema = z.object({
  id: z.string(),
  label_tc: z.string(),
  unit: z.string(),
  frequency: frequencySchema,
  latest: dataPointSchema.optional(),
  previous: dataPointSchema.optional(),
  change_abs: z.number().optional(),
  change_pct: z.number().optional(),
  sparkline_points: z.array(dataPointSchema),
  history_points: z.array(dataPointSchema),
  source_name: z.string(),
  source_url: z.string().url(),
  source_note: z.string().optional(),
  freshness: freshnessSchema,
  stale_reason: z.string().optional(),
  expected_update: z.string().optional()
});

export const dashboardCardSchema = z.object({
  id: z.string(),
  title_tc: z.string(),
  metrics: z.array(metricSeriesSchema),
  latest_data_at: z.string().optional(),
  stale_reason: z.string().optional()
});

export const dashboardPayloadSchema = z.object({
  generated_at: z.string(),
  cards: z.array(dashboardCardSchema)
});

export const dashboardManifestSchema = z.object({
  generated_at: z.string(),
  card_ids: z.array(z.string()),
  history_paths: z.record(z.string(), z.string())
});

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
