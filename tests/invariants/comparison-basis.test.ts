import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("comparison basis is explicit and preserved into UI text", () => {
  const canonical = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const employment = canonical.cards.find((item: any) => item.id === "employment");
  assert.equal(employment.metrics.find((item: any) => item.id === "unemployment").comparison_basis, "previous_rolling_window");

  const retail = canonical.cards
    .find((item: any) => item.id === "consumption-travel")
    .metrics.find((item: any) => item.id === "retail_sales");
  assert.equal(retail.comparison_basis, "same_period_last_year");

  const population = canonical.cards
    .find((item: any) => item.id === "population")
    .metrics.find((item: any) => item.id === "population_total");
  assert.equal(population.comparison_basis, "same_period_last_year");
  assert.equal(population.comparison_basis_label_tc, "較去年同期");

  const minimumWage = canonical.cards
    .find((item: any) => item.id === "minimum-wage")
    .metrics.find((item: any) => item.id === "statutory_minimum_wage");
  assert.equal(minimumWage.comparison_basis, "event_previous_effective");

  const uiPopulation = ui.cards
    .find((item: any) => item.id === "population")
    .metrics.find((item: any) => item.id === "population_total");
  assert.equal(uiPopulation.display_comparison_basis_text, "較去年同期");
});
