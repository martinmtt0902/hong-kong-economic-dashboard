import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("chart definitions are explicit and match rendered points", () => {
  const canonical = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  for (const card of canonical.cards) {
    for (const metric of card.metrics) {
      assert.ok(metric.chart_definition.series_id.length > 0);
      assert.ok(metric.chart_definition.metric_type.length > 0);
      const uiMetric = ui.cards
        .find((item: any) => item.id === card.id)
        .metrics.find((item: any) => item.id === metric.id);

      if (metric.validation_state === "ok" && metric.chart_points.length >= 1) {
        assert.equal(uiMetric.chart.points.length, metric.chart_points.length);
      }
    }
  }
});
