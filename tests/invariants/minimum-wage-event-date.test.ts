import test from "node:test";
import assert from "node:assert/strict";
import { parseMinimumWageObservations } from "../../scripts/fetch/labour";
import { buildTransformedMetric } from "../../scripts/lib/transform";
import { metricDefinitions } from "../../scripts/lib/metric-definition";

const current = metricDefinitions.find((d) => d.metric.id === "statutory_minimum_wage_current")!.metric;
const next = metricDefinitions.find((d) => d.metric.id === "statutory_minimum_wage_next")!.metric;
test("minimum wage parser accepts revised official wording and preserves effective date", () => {
  const points = parseMinimumWageObservations("<p>The SMW rate is raised to <b>$43.1</b> per hour with effect from 1 May 2026.</p>", current.source, current.label_tc);
  assert.equal(points[0].as_of_date, "2026-05-01");
  assert.equal(points[0].value, 43.1);
  assert.equal(buildTransformedMetric({ definition: current, primarySeries: points, referenceDate: "2026-11-06" }).latest_value, 43.1);
  assert.equal(buildTransformedMetric({ definition: next, primarySeries: points, referenceDate: "2026-11-06" }).latest_value, undefined);
});
test("announced rate moves from next to current on its effective date", () => {
  const points = parseMinimumWageObservations("The prevailing SMW rate is $42.1 per hour effective from 1 May 2025. raise the SMW rate to $43.1 per hour and come into force on 1 May 2026", current.source, current.label_tc);
  assert.equal(buildTransformedMetric({ definition: next, primarySeries: points, referenceDate: "2026-04-30" }).as_of_date, "2026-05-01");
  assert.equal(buildTransformedMetric({ definition: current, primarySeries: points, referenceDate: "2026-05-01" }).latest_value, 43.1);
});
