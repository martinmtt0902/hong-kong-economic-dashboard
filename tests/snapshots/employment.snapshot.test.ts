import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("employment snapshot matches official latest values", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "employment");
  const uiCard = ui.cards.find((item: any) => item.id === "employment");

  assert.equal(card.latest_as_of_label, "2025年12月–2026年2月");

  const unemployment = card.metrics.find((item: any) => item.id === "unemployment");
  assert.equal(unemployment.latest_value, 3.8);
  assert.equal(unemployment.previous_value, 3.9);
  assert.equal(unemployment.change_value, -0.1);
  assert.equal(unemployment.comparison_type, "previous_rolling_window");
  assert.equal(unemployment.comparison_period_label, "2025年11月–2026年1月");

  const underemployment = card.metrics.find((item: any) => item.id === "underemployment");
  assert.equal(underemployment.latest_value, 1.7);

  const labourForce = card.metrics.find((item: any) => item.id === "labour_force");
  assert.equal(labourForce.latest_value, 3797700);
  assert.equal(labourForce.previous_value, 3804300);
  assert.equal(labourForce.change_value, -6600);

  const lfpr = card.metrics.find((item: any) => item.id === "labour_force_participation_rate");
  assert.equal(lfpr.latest_value, 56.5);
  assert.equal(lfpr.previous_value, 56.7);
  assert.equal(lfpr.comparison_period_label, "2025年11月–2026年1月");

  const vacancies = card.metrics.find((item: any) => item.id === "vacancies");
  assert.equal(vacancies.latest_value, 51452);
  assert.equal(vacancies.previous_value, 66457);
  assert.equal(vacancies.comparison_period_label, "2024年第3季");
  assert.match(vacancies.source_note, /establishment-based/);

  const unemploymentUi = uiCard.metrics.find((item: any) => item.id === "unemployment");
  assert.equal(unemploymentUi.display_change_text, "較上一個三個月移動窗（2025年11月–2026年1月） -0.1 個百分點");
  assert.equal(unemploymentUi.display_previous_text, "上一個三個月移動窗（2025年11月–2026年1月） 3.9%");
  assert.equal(unemploymentUi.status_text_tc, "最新");
  assert.equal(unemploymentUi.data_origin, "live");

  const labourForceUi = uiCard.metrics.find((item: any) => item.id === "labour_force");
  assert.equal(labourForceUi.display_value_text, "3,797,700");
  assert.equal(labourForceUi.display_change_text, "較上一個三個月移動窗（2025年11月–2026年1月） -6,600");
  assert.equal(labourForceUi.status_text_tc, "最新");
  assert.equal(labourForceUi.data_origin, "live");
});
