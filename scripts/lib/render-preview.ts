import type { DashboardPayloadV2, TransformedMetric, UIMetricRow } from "./types";

export type RenderPreviewRow = {
  metric_id: string;
  raw_count: number;
  transformed_payload: TransformedMetric;
  rendered_preview: UIMetricRow;
};

export function renderPreviewMarkdown(payload: DashboardPayloadV2, rows: RenderPreviewRow[]): string {
  const focusCards = new Set(["employment", "inflation", "gdp", "consumption-travel", "population"]);

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
      lines.push(`1. Raw payload summary: ${row.raw_count} rows`);
      lines.push(`2. Transformed payload: latest=${metric.latest_value ?? "n/a"}, previous=${metric.previous_value ?? "n/a"}, change=${metric.change_value ?? "n/a"}`);
      lines.push(`3. Rendered text: ${row.rendered_preview.display_value_text} | ${row.rendered_preview.display_change_text} | ${row.rendered_preview.display_previous_text}`);
      lines.push(`4. Comparison basis: ${metric.comparison_basis_label_tc}`);
      lines.push(`5. Sparkline definition: ${metric.sparkline_definition.metric_type} / ${metric.sparkline_definition.series_id}`);
      lines.push(`6. Validation result: ${metric.validation_state}`);
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}
