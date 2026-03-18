import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("measure mapping uses the intended codes and labels", () => {
  const rows = readJson<any[]>("artifacts/reports/raw-to-transformed.json");

  const unemployment = rows.find((item) => item.metric_id === "unemployment");
  assert.equal(unemployment.raw_payload.primary.at(-1).measure_code, "SAUR");
  assert.equal(unemployment.raw_payload.primary.at(-1).measure_label_tc, "(%)");

  const cpi = rows.find((item) => item.metric_id === "cpi_yoy");
  assert.equal(cpi.raw_payload.primary.at(-1).measure_code, "CC_CM_1920");
  assert.equal(cpi.raw_payload.primary.at(-1).measure_label_tc, "按年變動百分率");

  const gdpNominal = rows.find((item) => item.metric_id === "gdp_nominal_yoy");
  assert.equal(gdpNominal.raw_payload.primary.at(-1).measure_code, "CUR");
  assert.equal(gdpNominal.raw_payload.primary.at(-1).measure_label_tc, "按年變動百分率");

  const births = rows.find((item) => item.metric_id === "live_births");
  assert.equal(births.raw_payload.primary.at(-1).measure_code, "REGISTERED_BIRTHS_TOTAL");
  assert.equal(births.transformed_payload.label_tc, "出生登記總數");
});
