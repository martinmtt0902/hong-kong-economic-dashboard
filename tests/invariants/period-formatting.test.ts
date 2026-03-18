import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("period labels are normalized to dates or periods", () => {
  const canonical = readJson<any>("public/data/dashboard.v2.json");

  const employment = canonical.cards.find((item: any) => item.id === "employment");
  assert.equal(employment.latest_as_of_label, "2025年11月–2026年1月");

  const gdp = canonical.cards.find((item: any) => item.id === "gdp");
  assert.equal(gdp.latest_as_of_label, "2025年第4季");

  const population = canonical.cards.find((item: any) => item.id === "population");
  assert.equal(population.latest_as_of_label, "2025年年底");

  const rates = canonical.cards.find((item: any) => item.id === "interest-rates");
  const baseRate = rates.metrics.find((item: any) => item.id === "base_rate");
  assert.match(baseRate.as_of_label, /^\d{4}-\d{2}-\d{2}$/);

  const minimumWage = canonical.cards
    .find((item: any) => item.id === "minimum-wage")
    .metrics.find((item: any) => item.id === "statutory_minimum_wage_next");
  assert.equal(minimumWage.as_of_label, "2026-05-01");
});
