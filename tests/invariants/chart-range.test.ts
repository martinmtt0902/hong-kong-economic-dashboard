import test from "node:test";
import assert from "node:assert/strict";
import { availableChartRanges, selectChartRange } from "../../src/lib/chartRange";
import type { UIChart } from "../../src/types";
const chart = { frequency: "monthly", chart_type: "line", points: Array.from({ length: 144 }, (_, i) => {
  const year = 2015 + Math.floor(i / 12), month = String(i % 12 + 1).padStart(2, "0");
  return { date: `${year}-${month}-28`, x: `${year}-${month}`, y: i, tick_label: month, tooltip_title: `${year}-${month}`, tooltip_value_text: String(i) };
}) } as UIChart;
test("one year has 12 monthly points and readable labels", () => {
  const view = selectChartRange(chart, 1);
  assert.equal(view.unit, "month");
  assert.equal(view.points.length, 12);
  assert.ok(view.ticks.length <= 6);
  assert.equal(view.points[0].date, "2026-01-28");
});
test("one year falls back to four quarterly points when monthly coverage is unavailable", () => {
  const quarterly = { ...chart, frequency: "quarterly" as const, points: chart.points.filter((p) => ["03", "06", "09", "12"].includes(p.date!.slice(5, 7))) };
  const view = selectChartRange(quarterly, 1);
  assert.equal(view.unit, "quarter");
  assert.equal(view.points.length, 4);
});
test("three years contain 12 quarter-end samples with original values and period labels", () => {
  const view = selectChartRange(chart, 3);
  assert.equal(view.unit, "quarter");
  assert.equal(view.points.length, 12);
  assert.equal(view.points[0].date, "2024-03-28");
  assert.equal(view.points.at(-1)!.y, 143);
  assert.equal(view.points.at(-1)!.tooltip_title, "2026-12");
  assert.ok(view.ticks.length <= 6);
});
test("three years fall back to three yearly points for annual and half-yearly series", () => {
  for (const frequency of ["annual", "half_yearly"] as const) {
    const sparse = { ...chart, frequency, points: chart.points.filter((p) => p.date!.slice(5, 7) === "12" || frequency === "half_yearly" && p.date!.slice(5, 7) === "06") };
    const view = selectChartRange(sparse, 3);
    assert.equal(view.unit, "year");
    assert.equal(view.points.length, 3);
  }
});
test("ten years show ten yearly points when all ten years are available", () => {
  assert.deepEqual(availableChartRanges(chart), [1, 3, 10]);
  const view = selectChartRange(chart, 10);
  assert.equal(view.points.length, 10);
  assert.equal(view.points[0].axisLabel, "2017");
  assert.equal(view.points.at(-1)!.axisLabel, "2026");
  assert.ok(view.ticks.length <= 6);
});
test("less than ten years caps the longest option and requested view at seven years", () => {
  const nineYears = { ...chart, points: chart.points.filter((p) => p.date! >= "2018-01-01") };
  assert.deepEqual(availableChartRanges(nineYears), [1, 3, 7]);
  const view = selectChartRange(nineYears, 10);
  assert.equal(view.years, 7);
  assert.equal(view.points.length, 7);
  assert.equal(view.points[0].axisLabel, "2020");
});
test("missing years are not invented or compressed, and incomplete ten-year histories cap at seven", () => {
  const sparse = { ...chart, points: chart.points.filter((p) => !p.date!.startsWith("2023-")) };
  assert.deepEqual(availableChartRanges(sparse), [1, 3, 7]);
  const view = selectChartRange(sparse, 10);
  assert.equal(view.points.length, 6);
  assert.equal(view.points[3].slot - view.points[2].slot, 2);
});
test("short and empty histories remain sparse", () => {
  assert.equal(selectChartRange({ ...chart, points: chart.points.slice(-3) }, 10).points.length, 1);
  assert.equal(selectChartRange({ ...chart, points: [] }, 10).points.length, 0);
});
test("monthly and quarterly samples keep the last actual observation, not an average", () => {
  const daily = { ...chart, frequency: "daily" as const, points: [...chart.points, { ...chart.points.at(-1)!, date: "2026-12-30", y: 999 }] };
  assert.equal(selectChartRange(daily, 1).points.at(-1)!.y, 999);
  assert.equal(selectChartRange(daily, 3).points.at(-1)!.y, 999);
});

import { buildTransformedMetric } from "../../scripts/lib/transform";
import { metricDefinitions } from "../../scripts/lib/metric-definition";
test("data generation retains ten calendar years rather than truncating at seven", () => {
  const definition = metricDefinitions.find((d) => d.metric.id === "median_age")!.metric;
  const primarySeries = Array.from({ length: 15 }, (_, i) => ({ source: definition.source, series_id: definition.id, as_of_date: `${2012 + i}-12-31`, as_of_label: `${2012 + i}年`, period_raw: String(2012 + i), value: 40 + i / 10, measure_label_tc: "(歲)" })) as any;
  const metric = buildTransformedMetric({ definition, primarySeries, referenceDate: "2026-12-31" });
  assert.equal(metric.chart_points.length, 10);
  assert.equal(metric.chart_points[0].as_of_date, "2017-12-31");
});
