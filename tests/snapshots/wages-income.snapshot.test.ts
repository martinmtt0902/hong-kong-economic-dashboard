import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("wages and income snapshot uses official framework-aligned titles and values", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "wages-income");
  const uiCard = ui.cards.find((item: any) => item.id === "wages-income");

  const payroll = card.metrics.find((item: any) => item.id === "real_payroll_per_person_engaged_index");
  assert.equal(payroll.label_tc, "從業人士實質平均薪金指數");
  assert.equal(payroll.dataset_id, "hk-censtatd-tablechart-220-19024");
  assert.match(payroll.statistical_framework, /Labour Earnings Survey/);
  assert.equal(payroll.latest_value, 125.5);
  assert.equal(payroll.previous_value, 123.4);
  assert.equal(payroll.comparison_period_label, "2024年第3季");

  const monthly = card.metrics.find((item: any) => item.id === "median_monthly_wage");
  assert.equal(monthly.dataset_id, "hk-censtatd-tablechart-220-23011");
  assert.match(monthly.statistical_framework, /AEHS/);
  assert.equal(monthly.latest_value, 20500);
  assert.equal(monthly.previous_value, 19800);
  assert.equal(monthly.frequency, "annual");

  const hourly = card.metrics.find((item: any) => item.id === "median_hourly_wage");
  assert.equal(hourly.dataset_id, "hk-censtatd-tablechart-220-23024");
  assert.match(hourly.statistical_framework, /AEHS/);
  assert.equal(hourly.latest_value, 82.9);
  assert.equal(hourly.previous_value, 80.1);
  assert.equal(hourly.frequency, "annual");

  const monthlyUi = uiCard.metrics.find((item: any) => item.id === "median_monthly_wage");
  assert.equal(monthlyUi.display_value_text, "20,500元");
  assert.equal(monthlyUi.display_change_text, "較上期（2023年） +700元");

  const hourlyUi = uiCard.metrics.find((item: any) => item.id === "median_hourly_wage");
  assert.equal(hourlyUi.display_value_text, "82.9元/小時");
  assert.equal(hourlyUi.display_previous_text, "上期（2023年） 80.1元/小時");
});
