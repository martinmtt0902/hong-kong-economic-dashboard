import test from "node:test";
import assert from "node:assert/strict";
import { parseOfficialPeriod, formatRollingWindowLabel } from "../../scripts/lib/period";
import { readJson } from "../helpers/loadData";

test("official monthly formats normalize before sorting, including RVD MM-YYYY", () => {
  assert.equal(parseOfficialPeriod("09-2026", "monthly").as_of_date, "2026-09-30");
  assert.equal(parseOfficialPeriod("12-2025", "monthly").as_of_date, "2025-12-31");
  assert.equal(parseOfficialPeriod("Feb-24", "monthly").as_of_date, "2024-02-29");
  assert.equal(parseOfficialPeriod("202609", "monthly").as_of_label, "2026年9月");
  assert.equal(formatRollingWindowLabel("202602"), "2025年12月–2026年2月");
});

test("all available chart periods are ISO dates in chronological order", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  for (const metric of payload.cards.flatMap((card: any) => card.metrics)) {
    const dates = metric.chart_points.map((p: any) => p.as_of_date);
    dates.forEach((date: string) => assert.match(date, /^\d{4}-\d{2}-\d{2}$/, metric.id));
    assert.deepEqual(dates, [...dates].sort(), metric.id);
    assert.equal(new Set(dates).size, dates.length, metric.id);
  }
});

import { selectPreviousObservation } from "../../scripts/lib/transform";
test("year-on-year comparison clamps leap day to the prior February month end", () => {
  const rows = [{ as_of_date: "2023-02-28", value: 10 }, { as_of_date: "2024-02-29", value: 20 }] as any;
  assert.equal(selectPreviousObservation(rows, rows[1], "same_period_last_year")?.value, 10);
});
