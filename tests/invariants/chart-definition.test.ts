import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("every metric has explicit chart metadata and tooltip unit", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");

  for (const card of payload.cards) {
    for (const metric of card.metrics) {
      assert.ok(metric.chart_definition);
      assert.ok(metric.chart_definition.x_axis_label);
      assert.ok(metric.chart_definition.y_axis_label);
      assert.ok(metric.chart_definition.time_label);
      assert.ok(metric.chart_definition.value_label);
      assert.ok(metric.chart_definition.chart_value_transform);
      assert.ok(metric.chart_definition.chart_value_transform.scale > 0);
      if (metric.chart_points.length > 0) {
        const tooltip = metric.chart_points[0].tooltip_value_text;
        assert.ok(tooltip.length > 0);
        if (metric.display_unit === "%") {
          assert.match(tooltip, /%/);
        }
        if (metric.display_unit === "HK$/小時") {
          assert.match(tooltip, /HK\$/);
        }
        if (metric.display_unit === "億港元") {
          assert.match(tooltip, /億/);
        }
      }
    }
  }
});
