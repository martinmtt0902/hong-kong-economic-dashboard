import test from "node:test";
import assert from "node:assert/strict";
import { toUIMetricRow } from "../../scripts/lib/ui-adapter";

test("source_error snapshot mode is rendered as preserved data, not live", () => {
  const ui = toUIMetricRow({
    id: "base_rate",
    card_id: "interest-rates",
    label_tc: "HKMA Base Rate",
    source: { publisher: "香港金融管理局", dataset_url: "https://example.com" },
    series_id: "hkma|base_rate",
    metric_type: "level",
    frequency: "daily",
    unit: "%",
    display_unit: "%",
    rounding_policy: { value_decimals: 1, change_decimals: 1, previous_decimals: 1 },
    as_of_date: "2026-03-17",
    as_of_label: "2026-03-17",
    latest_value: 4,
    previous_value: 4,
    previous_as_of_date: "2026-03-16",
    previous_as_of_label: "2026-03-16",
    change_value: 0,
    change_type: "percentage_point_change",
    comparison_type: "previous_observation",
    comparison_basis: "previous_observation",
    comparison_basis_label_tc: "較上期",
    comparison_period_label: "2026-03-16",
    data_origin: "last_successful_snapshot",
    last_successful_fetch_at: "2026-03-17T10:15:00+08:00",
    chart_definition: {
      series_id: "hkma|base_rate",
      metric_type: "level",
      chart_type: "line",
      frequency: "daily",
      unit: "%",
      display_unit: "%",
      period_start: "2026-03-01",
      period_end: "2026-03-17",
      x_axis_label: "日期",
      y_axis_label: "HKMA Base Rate (%)",
      value_label: "HKMA Base Rate",
      time_label: "日期",
      suggested_ticks: ["2026-03-01", "2026-03-17"]
    },
    chart_points: [],
    sparkline_definition: {
      series_id: "hkma|base_rate",
      metric_type: "level",
      comparison_basis: "previous_observation",
      unit: "%",
      frequency: "daily"
    },
    sparkline_points: [],
    validation_state: "source_error",
    validation_messages: [{ code: "source_missing", level: "error", message_tc: "fetch failed" }]
  } as any);

  assert.equal(ui.status_text_tc, "上次成功抓取值");
  assert.equal(ui.data_origin, "last_successful_snapshot");
  assert.equal(ui.display_value_text, "4.0%");
});
