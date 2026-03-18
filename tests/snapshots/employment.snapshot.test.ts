import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("employment snapshot matches official latest values", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "employment");
  const uiCard = ui.cards.find((item: any) => item.id === "employment");

  assert.equal(card.latest_as_of_label, "2025年11月–2026年1月");

  const unemployment = card.metrics.find((item: any) => item.id === "unemployment");
  assert.equal(unemployment.latest_value, 3.9);
  assert.equal(unemployment.previous_value, 3.8);
  assert.equal(unemployment.change_value, 0.1);
  assert.equal(unemployment.comparison_type, "previous_rolling_window");
  assert.equal(unemployment.comparison_period_label, "2025年10月–12月");

  const underemployment = card.metrics.find((item: any) => item.id === "underemployment");
  assert.equal(underemployment.latest_value, 1.7);

  const labourForce = card.metrics.find((item: any) => item.id === "labour_force");
  assert.equal(labourForce.latest_value, 3804300);
  assert.equal(labourForce.previous_value, 3805200);
  assert.equal(labourForce.change_value, -900);

  const unemploymentUi = uiCard.metrics.find((item: any) => item.id === "unemployment");
  assert.equal(unemploymentUi.display_change_text, "較上一個三個月移動窗（2025年10月–12月） +0.1 個百分點");
  assert.equal(unemploymentUi.display_previous_text, "上一個三個月移動窗（2025年10月–12月） 3.8%");

  const labourForceUi = uiCard.metrics.find((item: any) => item.id === "labour_force");
  assert.equal(labourForceUi.display_value_text, "3,804,300");
  assert.equal(labourForceUi.display_change_text, "較上一個三個月移動窗（2025年10月–12月） -900");
});
