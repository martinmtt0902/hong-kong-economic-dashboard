import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("new official metrics keep source system, dataset and comparison metadata", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const metrics = payload.cards.flatMap((card: any) => card.metrics);

  for (const metricId of [
    "labour_force_participation_rate",
    "vacancies",
    "real_payroll_per_person_engaged_index",
    "median_monthly_wage",
    "median_hourly_wage",
    "current_account_balance",
    "private_consumption_expenditure",
    "total_exports_value",
    "imports_value",
    "visible_trade_balance",
    "money_supply_m3"
  ]) {
    const metric = metrics.find((item: any) => item.id === metricId);
    assert.ok(metric.source_system);
    assert.ok(metric.dataset_id || metric.table_id);
    assert.ok(metric.dataset_title);
    assert.ok(metric.statistical_framework);
    assert.ok(metric.frequency);
    assert.ok(metric.as_of_date);
    assert.ok(metric.unit);
    assert.ok(metric.metric_type);
    assert.ok(metric.comparison_type);
    if (typeof metric.previous_value === "number") {
      assert.ok(metric.comparison_period_label);
    }
  }
});
