import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("minimum wage snapshot separates current and next effective rates", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "minimum-wage");
  const uiCard = ui.cards.find((item: any) => item.id === "minimum-wage");

  assert.equal(card.latest_as_of_label, "2025-05-01");
  assert.equal(uiCard.periods_summary_text_tc, "各卡更新期不同，請以各列期別為準");

  const current = card.metrics.find((item: any) => item.id === "statutory_minimum_wage_current");
  assert.equal(current.latest_value, 42.1);
  assert.equal(current.as_of_label, "2025-05-01");

  const next = card.metrics.find((item: any) => item.id === "statutory_minimum_wage_next");
  assert.equal(next.latest_value, 43.1);
  assert.equal(next.previous_value, 42.1);
  assert.equal(next.comparison_period_label, "2025-05-01");
  assert.equal(next.reason, "將於 2026-05-01 生效");

  const nextUi = uiCard.metrics.find((item: any) => item.id === "statutory_minimum_wage_next");
  assert.equal(nextUi.display_value_text, "HK$43.1/小時");
  assert.equal(nextUi.display_change_text, "較上一次生效值（2025-05-01） +HK$1.0/小時");
});
