import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("inflation snapshot matches official CPI yoy", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "inflation");
  const uiCard = ui.cards.find((item: any) => item.id === "inflation");
  const metric = card.metrics.find((item: any) => item.id === "cpi_yoy");
  const uiMetric = uiCard.metrics.find((item: any) => item.id === "cpi_yoy");

  assert.equal(card.latest_as_of_label, "2026年1月");
  assert.equal(metric.latest_value, 1.1);
  assert.equal(metric.previous_value, 1.4);
  assert.equal(metric.change_value, -0.3);
  assert.equal(metric.metric_type, "yoy_percent");
  assert.equal(metric.change_type, "percentage_point_change");
  assert.equal(uiMetric.display_value_text, "+1.1%");
  assert.equal(uiMetric.display_change_text, "較上期 -0.3 個百分點");
});
