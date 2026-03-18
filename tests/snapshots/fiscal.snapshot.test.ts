import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("fiscal snapshot keeps headline, previous and delta in 億港元", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "fiscal");
  const uiCard = ui.cards.find((item: any) => item.id === "fiscal");

  const revenue = card.metrics.find((item: any) => item.id === "government_revenue");
  assert.equal(revenue.display_unit, "億港元");
  assert.equal(revenue.comparison_period_label, "2025-26 (修訂預算)");

  const revenueUi = uiCard.metrics.find((item: any) => item.id === "government_revenue");
  assert.equal(revenueUi.display_value_text, "HK$7652.3億");
  assert.equal(revenueUi.display_change_text, "較上期（2025-26 (修訂預算)） +764.7億");
  assert.equal(revenueUi.display_previous_text, "上期（2025-26 (修訂預算)） HK$6887.6億");
});
