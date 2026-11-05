import test from "node:test";
import assert from "node:assert/strict";
import { selectChartRange } from "../../src/lib/chartRange";
import type { UIChart } from "../../src/types";
const chart = { frequency: "monthly", chart_type: "line", points: Array.from({ length: 96 }, (_, i) => {
  const year = 2019 + Math.floor(i / 12), month = String(i % 12 + 1).padStart(2, "0");
  return { date: `${year}-${month}-28`, x: `${year}-${month}`, y: i, tick_label: month, tooltip_title: `${year}-${month}`, tooltip_value_text: String(i) };
}) } as UIChart;
test("one year has 12 monthly points and readable labels", () => {
  const view = selectChartRange(chart, 1);
  assert.equal(view.points.length, 12);
  assert.ok(view.ticks.length <= 7);
  assert.equal(view.points[0].date, "2026-01-28");
});
test("seven years have seven yearly observations, retaining the original period/value", () => {
  const view = selectChartRange(chart, 7);
  assert.equal(view.points.length, 7);
  assert.deepEqual(view.points.map((p) => p.axisLabel), ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]);
  assert.equal(view.points.at(-1)!.y, 95);
  assert.equal(view.points.at(-1)!.tooltip_title, "2026-12");
});
test("missing months/years are not invented or compressed", () => {
  const sparse = { ...chart, points: chart.points.filter((p) => !p.date!.startsWith("2023-") && p.date !== "2026-05-28") };
  const monthly = selectChartRange(sparse, 1);
  assert.equal(monthly.points.length, 11);
  assert.equal(monthly.points[4].slot - monthly.points[3].slot, 2);
  assert.equal(selectChartRange(sparse, 7).points.length, 6);
});
test("short and empty histories are supported without filling unavailable years", () => {
  assert.equal(selectChartRange({ ...chart, points: chart.points.slice(-3) }, 7).points.length, 1);
  assert.equal(selectChartRange({ ...chart, points: [] }, 7).points.length, 0);
});
test("daily data uses each month's last available observation", () => {
  const daily = { ...chart, frequency: "daily" as const, points: [{ ...chart.points[0], date: "2026-01-05", y: 2 }, { ...chart.points[1], date: "2026-01-30", y: 4 }] };
  assert.deepEqual(selectChartRange(daily, 1).points.map((p) => p.y), [4]);
});
