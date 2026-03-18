import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("minimum wage event dates do not drift backward by timezone parsing", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const card = payload.cards.find((item: any) => item.id === "minimum-wage");

  const current = card.metrics.find((item: any) => item.id === "statutory_minimum_wage_current");
  const next = card.metrics.find((item: any) => item.id === "statutory_minimum_wage_next");

  assert.equal(current.as_of_date, "2025-05-01");
  assert.equal(next.as_of_date, "2026-05-01");
});
