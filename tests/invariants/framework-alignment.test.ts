import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("new metrics preserve official dataset titles and statistical frameworks", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const metrics = payload.cards.flatMap((card: any) => card.metrics);

  const payroll = metrics.find((item: any) => item.id === "real_payroll_per_person_engaged_index");
  assert.equal(payroll.label_tc, "從業人士實質平均薪金指數");
  assert.match(payroll.dataset_title, /從業人士實質平均薪金指數/);
  assert.match(payroll.statistical_framework, /Labour Earnings Survey/);

  const monthly = metrics.find((item: any) => item.id === "median_monthly_wage");
  const hourly = metrics.find((item: any) => item.id === "median_hourly_wage");
  assert.match(monthly.statistical_framework, /AEHS/);
  assert.match(hourly.statistical_framework, /AEHS/);

  const pce = metrics.find((item: any) => item.id === "private_consumption_expenditure");
  assert.equal(pce.card_id, "gdp");
  assert.match(pce.statistical_framework, /National Accounts/);
});
