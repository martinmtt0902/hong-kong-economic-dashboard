import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("gdp snapshot matches official real and nominal yoy", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");
  const card = payload.cards.find((item: any) => item.id === "gdp");

  assert.equal(card.latest_as_of_label, "2025年第4季");

  const real = card.metrics.find((item: any) => item.id === "gdp_real_yoy");
  assert.equal(real.latest_value, 3.8);
  assert.equal(real.previous_value, 3.7);
  assert.equal(real.change_value, 0.1);
  assert.equal(real.metric_type, "yoy_percent");
  assert.equal(real.comparison_period_label, "2025年第3季");

  const nominal = card.metrics.find((item: any) => item.id === "gdp_nominal_yoy");
  assert.equal(nominal.latest_value, 5.1);
  assert.equal(nominal.previous_value, 4.6);
  assert.equal(nominal.change_value, 0.5);
  assert.equal(nominal.metric_type, "yoy_percent");
  assert.equal(nominal.comparison_period_label, "2025年第3季");

  const currentAccount = card.metrics.find((item: any) => item.id === "current_account_balance");
  assert.equal(currentAccount.dataset_id, "hk-censtatd-tablechart-315-37003");
  assert.equal(currentAccount.source_system, "official_report_pdf");
  assert.equal(currentAccount.latest_value, 98175);
  assert.equal(currentAccount.previous_value, 95808);
  assert.equal(currentAccount.balance_change_narrative, "surplus_increased");
  assert.equal(currentAccount.display_change_narrative_text, "較上期（2025年第2季） 順差增加 23.7億");
  assert.match(currentAccount.transformation_formula, /Table 2\.1/);

  const pce = card.metrics.find((item: any) => item.id === "private_consumption_expenditure");
  assert.equal(pce.dataset_id, "hk-censtatd-tablechart-310-31012");
  assert.equal(pce.latest_value, 2.7);
  assert.equal(pce.previous_value, 2.4);
  assert.equal(pce.chart_metric_type, "yoy_percent");
  assert.equal(pce.comparison_period_label, "2025年第3季");
  assert.match(pce.transformation_formula, /310-31012/);

  const gdpUi = ui.cards.find((item: any) => item.id === "gdp");
  const currentAccountUi = gdpUi.metrics.find((item: any) => item.id === "current_account_balance");
  assert.equal(currentAccountUi.display_value_text, "順差 981.8億");
  assert.equal(currentAccountUi.display_change_text, "較上期（2025年第2季） 順差增加 23.7億");
});
