import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("measure mapping uses the intended codes and labels", () => {
  const rows = readJson<any[]>("artifacts/reports/raw-to-transformed.json");
  // Failed fetches must be clearly degraded; only live rows have raw input to compare.
  for (const row of rows) {
    if (!row.raw_payload.primary.length) assert.notEqual(row.transformed_payload.data_origin, "live", row.metric_id);
  }

  const unemployment = rows.find((item) => item.metric_id === "unemployment");
  if (unemployment.raw_payload.primary.length) assert.equal(unemployment.raw_payload.primary.at(-1).measure_code, "SAUR");
  if (unemployment.raw_payload.primary.length) assert.equal(unemployment.raw_payload.primary.at(-1).measure_label_tc, "(%)");

  const cpi = rows.find((item) => item.metric_id === "cpi_yoy");
  if (cpi.raw_payload.primary.length) assert.equal(cpi.raw_payload.primary.at(-1).measure_code, "CC_CM_1920");
  if (cpi.raw_payload.primary.length) assert.equal(cpi.raw_payload.primary.at(-1).measure_label_tc, "按年變動百分率");

  const gdpNominal = rows.find((item) => item.metric_id === "gdp_nominal_yoy");
  if (gdpNominal.raw_payload.primary.length) assert.equal(gdpNominal.raw_payload.primary.at(-1).measure_code, "CUR");
  if (gdpNominal.raw_payload.primary.length) assert.equal(gdpNominal.raw_payload.primary.at(-1).measure_label_tc, "按年變動百分率");

  const births = rows.find((item) => item.metric_id === "live_births");
  if (births.raw_payload.primary.length) assert.equal(births.raw_payload.primary.at(-1).measure_code, "REGISTERED_BIRTHS_TOTAL");
  assert.equal(births.transformed_payload.label_tc, "出生登記總數");
});
