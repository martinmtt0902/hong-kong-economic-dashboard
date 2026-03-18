import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("interest-rate snapshot renders live values without degraded-state flags on success", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "interest-rates");
  const uiCard = ui.cards.find((item: any) => item.id === "interest-rates");

  const baseRate = card.metrics.find((item: any) => item.id === "base_rate");
  assert.equal(baseRate.validation_state, "ok");
  assert.equal(baseRate.data_origin, "live");
  assert.ok(baseRate.last_successful_fetch_at);

  const baseRateUi = uiCard.metrics.find((item: any) => item.id === "base_rate");
  assert.equal(baseRateUi.status_text_tc, "最新");
  assert.equal(baseRateUi.data_origin, "live");
});
