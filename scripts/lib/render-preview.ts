import type { DashboardPayloadV2, TransformedMetric, UIMetricRow } from "./types";

export type RenderPreviewRow = {
  metric_id: string;
  raw_count: number;
  transformed_payload: TransformedMetric;
  rendered_preview: UIMetricRow;
};

export function renderPreviewMarkdown(payload: DashboardPayloadV2, rows: RenderPreviewRow[]): string {
  const focusCards = new Set([
    "minimum-wage",
    "housing",
    "interest-rates",
    "fiscal",
    "population",
    "consumption-travel",
    "employment",
    "inflation",
    "gdp"
  ]);

  const lines: string[] = ["# Render Preview", ""];

  for (const card of payload.cards.filter((item) => focusCards.has(item.id))) {
    lines.push(`## ${card.title_tc}`);
    lines.push("");

    for (const metric of card.metrics) {
      const row = rows.find((item) => item.metric_id === metric.id);
      if (!row) {
        continue;
      }

      lines.push(`### ${metric.label_tc}`);
      lines.push("");
      lines.push(`1. Raw payload: ${row.raw_count} rows`);
      lines.push(`2. Transformed payload: latest=${metric.latest_value ?? "n/a"}, previous=${metric.previous_value ?? "n/a"}, change=${metric.change_value ?? "n/a"}, release_date=${metric.release_date ?? "n/a"}`);
      lines.push(`3. Rendered text: ${row.rendered_preview.display_value_text} | ${row.rendered_preview.display_change_text} | ${row.rendered_preview.display_previous_text}`);
      lines.push(`4. Comparison type: ${metric.comparison_type}`);
      lines.push(`5. Comparison period label: ${metric.comparison_period_label ?? "n/a"}`);
      lines.push(`6. Display unit: ${metric.display_unit}`);
      lines.push(`7. Validation state: ${metric.validation_state}`);
      lines.push(`8. Chart series source: ${metric.chart_definition.series_id}`);
      lines.push(`9. Chart x-axis label: ${metric.chart_definition.x_axis_label}`);
      lines.push(`10. Chart y-axis label: ${metric.chart_definition.y_axis_label}`);
      lines.push(
        `11. Chart sample ticks / tooltip format: ${
          metric.chart_definition.suggested_ticks.join(", ") || "n/a"
        } / ${metric.chart_points[0]?.tooltip_title ?? "n/a"} | ${metric.chart_points[0]?.tooltip_value_text ?? "n/a"}`
      );
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}
