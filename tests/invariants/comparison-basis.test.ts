import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("comparison basis is explicit and preserved into UI text", () => {
  const canonical = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const employment = canonical.cards.find((item: any) => item.id === "employment");
  assert.equal(employment.metrics.find((item: any) => item.id === "unemployment").comparison_type, "previous_rolling_window");

  const retail = canonical.cards
    .find((item: any) => item.id === "consumption-travel")
    .metrics.find((item: any) => item.id === "retail_sales");
  assert.equal(retail.comparison_type, "same_period_last_year");

  const population = canonical.cards
    .find((item: any) => item.id === "population")
    .metrics.find((item: any) => item.id === "population_total");
  assert.equal(population.comparison_type, "same_period_last_year");
  assert.equal(population.comparison_basis_label_tc, "較去年同期");

  const minimumWage = canonical.cards
    .find((item: any) => item.id === "minimum-wage")
    .metrics.find((item: any) => item.id === "statutory_minimum_wage_next");
  assert.equal(minimumWage.comparison_type, "event_previous_effective");

  const vacancies = canonical.cards
    .find((item: any) => item.id === "employment")
    .metrics.find((item: any) => item.id === "vacancies");
  assert.equal(vacancies.comparison_type, "same_period_last_year");
  assert.equal(vacancies.comparison_basis_label_tc, "較去年同期");

  const pce = canonical.cards
    .find((item: any) => item.id === "gdp")
    .metrics.find((item: any) => item.id === "private_consumption_expenditure");
  assert.equal(pce.comparison_type, "previous_observation");
  assert.equal(pce.comparison_period_label, "2025年第3季");

  const uiPopulation = ui.cards
    .find((item: any) => item.id === "population")
    .metrics.find((item: any) => item.id === "population_total");
  assert.equal(uiPopulation.display_comparison_basis_text, "較去年同期");
  assert.equal(uiPopulation.display_comparison_period_text, "2024年底");
});
