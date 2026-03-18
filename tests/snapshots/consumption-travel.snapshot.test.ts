import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("consumption and travel snapshot matches latest official values", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "consumption-travel");
  const uiCard = ui.cards.find((item: any) => item.id === "consumption-travel");

  const retail = card.metrics.find((item: any) => item.id === "retail_sales");
  assert.equal(retail.latest_value, 37308);
  assert.equal(retail.previous_value, 35379);
  assert.equal(retail.change_value, 5.4524);
  assert.equal(retail.comparison_basis, "same_period_last_year");

  const visitor = card.metrics.find((item: any) => item.id === "visitor_arrivals");
  assert.equal(visitor.latest_value, 4811700);
  assert.equal(visitor.previous_value, 4742066);
  assert.ok(visitor.change_value > 1 && visitor.change_value < 2);
  assert.equal(visitor.comparison_basis, "same_period_last_year");

  const retailUi = uiCard.metrics.find((item: any) => item.id === "retail_sales");
  assert.equal(retailUi.display_value_text, "HK$373.1億");
  assert.equal(retailUi.display_change_text, "較去年同月 +5.5%");

  const visitorUi = uiCard.metrics.find((item: any) => item.id === "visitor_arrivals");
  assert.equal(visitorUi.display_previous_text, "去年同月 4,742,066");
});
