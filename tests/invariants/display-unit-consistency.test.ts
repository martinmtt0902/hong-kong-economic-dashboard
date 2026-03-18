import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("display_unit consistently drives headline, previous and change formatting", () => {
  const ui = readJson<any>("public/data/dashboard.json");
  const fiscal = ui.cards.find((item: any) => item.id === "fiscal");
  const revenue = fiscal.metrics.find((item: any) => item.id === "government_revenue");

  assert.match(revenue.display_value_text, /億/);
  assert.match(revenue.display_change_text, /億/);
  assert.match(revenue.display_previous_text, /億/);

  const wage = ui.cards.find((item: any) => item.id === "minimum-wage").metrics.find((item: any) => item.id === "statutory_minimum_wage_next");
  assert.match(wage.display_value_text, /HK\$/);
  assert.match(wage.display_change_text, /HK\$/);
});
