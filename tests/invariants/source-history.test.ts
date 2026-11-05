import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";
import { metricDefinitions } from "../../scripts/lib/metric-definition";

test("all 32 tracked statistics are retained, and live chart values match fetched observations", () => {
  const original = readJson<any>("tests/fixtures/march-2026/dashboard.v2.json");
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const reports = readJson<any[]>("artifacts/reports/raw-to-transformed.json");
  const ids = (p: any) => p.cards.flatMap((c: any) => c.metrics.map((m: any) => m.id)).sort();
  assert.deepEqual(ids(payload), ids(original));
  assert.deepEqual(metricDefinitions.map((d) => d.metric.id).sort(), ids(original));
  for (const row of reports) {
    const metric = row.transformed_payload;
    if (metric.data_origin !== "live") continue;
    const raw = row.raw_payload.primary;
    assert.ok(raw.length, metric.id);
    const eligible = metric.id === "statutory_minimum_wage_current" ? raw.filter((p: any) => p.as_of_date <= payload.generated_at.slice(0, 10)) : raw;
    if (metric.id !== "statutory_minimum_wage_next") {
      const latest = [...eligible].sort((a: any, b: any) => a.as_of_date.localeCompare(b.as_of_date)).at(-1);
      assert.equal(metric.latest_value, latest.value, metric.id);
      assert.equal(metric.as_of_date, latest.as_of_date, metric.id);
    }
    const source = metricDefinitions.find((d) => d.metric.id === metric.id)!.metric.sparkline_series_role === "auxiliary" ? row.raw_payload.auxiliary : raw;
    for (const point of metric.chart_points) {
      assert.ok(source.some((p: any) => p.as_of_date === point.as_of_date && p.value === point.value), `${metric.id}: ${point.as_of_date}`);
    }
  }
});
