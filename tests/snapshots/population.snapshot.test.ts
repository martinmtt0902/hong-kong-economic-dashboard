import test from "node:test";
import assert from "node:assert/strict";
import { readJson, readText } from "../helpers/loadData";

test("population snapshot matches official headline values and reports", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");
  const rawToTransformed = readJson<any[]>("artifacts/reports/raw-to-transformed.json");
  const preview = readText("artifacts/reports/render-preview.md");

  const card = payload.cards.find((item: any) => item.id === "population");
  const uiCard = ui.cards.find((item: any) => item.id === "population");

  const population = card.metrics.find((item: any) => item.id === "population_total");
  assert.equal(population.latest_value, 7510800);
  assert.equal(population.previous_value, 7500600);
  assert.equal(population.change_value, 10200);
  assert.equal(population.comparison_basis_label_tc, "較去年同期");

  const births = card.metrics.find((item: any) => item.id === "live_births");
  assert.equal(births.latest_value, 36723);
  assert.equal(births.previous_value, 33232);

  const medianAge = card.metrics.find((item: any) => item.id === "median_age");
  assert.equal(medianAge.latest_value, 48.4);

  const populationUi = uiCard.metrics.find((item: any) => item.id === "population_total");
  assert.equal(populationUi.display_change_text, "較去年同期 +10,200");
  assert.equal(populationUi.display_previous_text, "去年同期 7,500,600");

  assert.ok(rawToTransformed.some((item) => item.metric_id === "population_total"));
  assert.match(preview, /## 人口/);
  assert.match(preview, /### 出生數/);
});
