import test from "node:test";
import assert from "node:assert/strict";
import { buildTransformedMetric } from "../../scripts/lib/transform";
import { metricDefinitions } from "../../scripts/lib/metric-definition";
const definition = { ...metricDefinitions.find((d) => d.metric.id === "visible_trade_balance")!.metric, comparison_basis: "previous_observation" as const };
for (const [previous, latest, narrative] of [[10, -5, "surplus_to_deficit"], [-10, -5, "deficit_narrowed"], [5, 10, "surplus_increased"], [-5, 10, "deficit_to_surplus"]] as const) {
  test(`balance renders ${narrative}`, () => {
    const primarySeries = [previous, latest].map((value, i) => ({ source: definition.source, series_id: definition.id, as_of_date: `2026-0${i + 1}-28`, as_of_label: `2026年${i + 1}月`, period_raw: `20260${i + 1}`, value, measure_label_tc: "百萬港元" })) as any;
    const result = buildTransformedMetric({ definition, primarySeries, referenceDate: "2026-03-01" });
    assert.equal(result.balance_change_narrative, narrative);
    assert.equal(result.raw_change_value, latest - previous);
  });
}
