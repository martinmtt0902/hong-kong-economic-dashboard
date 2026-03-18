import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("long-term validation invariants hold", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");

  const population = payload.cards.find((item: any) => item.id === "population");
  const births = population.metrics.find((item: any) => item.id === "live_births");
  const birthsYear = Number(births.as_of_label.replace(/\D/g, "").slice(0, 4));
  assert.notEqual(births.latest_value, birthsYear);

  const labourForce = payload.cards
    .find((item: any) => item.id === "employment")
    .metrics.find((item: any) => item.id === "labour_force");
  assert.ok(labourForce.latest_value > 1000);

  const cpi = payload.cards
    .find((item: any) => item.id === "inflation")
    .metrics.find((item: any) => item.id === "cpi_yoy");
  assert.ok(cpi.latest_value > -20);
  assert.equal(cpi.metric_type, "yoy_percent");
  assert.equal(cpi.change_type, "percentage_point_change");

  const gdp = payload.cards
    .find((item: any) => item.id === "gdp")
    .metrics.find((item: any) => item.id === "gdp_real_yoy");
  assert.equal(gdp.metric_type, "yoy_percent");
  assert.equal(gdp.change_type, "percentage_point_change");
  assert.ok(Math.abs(gdp.latest_value) < 25);

  const metrics = payload.cards.flatMap((card: any) => card.metrics);
  for (const metric of metrics) {
    assert.ok(metric.sparkline_definition);
    assert.ok(metric.validation_state);
  }
});
