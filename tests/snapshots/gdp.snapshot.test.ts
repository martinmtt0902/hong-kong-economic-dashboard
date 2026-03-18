import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("gdp snapshot matches official real and nominal yoy", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const card = payload.cards.find((item: any) => item.id === "gdp");

  assert.equal(card.latest_as_of_label, "2025年第4季");

  const real = card.metrics.find((item: any) => item.id === "gdp_real_yoy");
  assert.equal(real.latest_value, 3.8);
  assert.equal(real.previous_value, 3.7);
  assert.equal(real.change_value, 0.1);
  assert.equal(real.metric_type, "yoy_percent");

  const nominal = card.metrics.find((item: any) => item.id === "gdp_nominal_yoy");
  assert.equal(nominal.latest_value, 5.1);
  assert.equal(nominal.previous_value, 4.6);
  assert.equal(nominal.change_value, 0.5);
  assert.equal(nominal.metric_type, "yoy_percent");
});
