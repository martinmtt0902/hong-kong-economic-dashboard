import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("interest-rate snapshot renders live values without degraded-state flags on success", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "interest-rates");
  const uiCard = ui.cards.find((item: any) => item.id === "interest-rates");
  assert.equal(card.title_tc, "貨幣與金融");

  const baseRate = card.metrics.find((item: any) => item.id === "base_rate");
  assert.equal(baseRate.validation_state, "ok");
  assert.equal(baseRate.data_origin, "live");
  assert.ok(baseRate.last_successful_fetch_at);

  const baseRateUi = uiCard.metrics.find((item: any) => item.id === "base_rate");
  assert.equal(baseRateUi.status_text_tc, "最新");
  assert.equal(baseRateUi.data_origin, "live");

  const m3 = card.metrics.find((item: any) => item.id === "money_supply_m3");
  assert.equal(m3.dataset_id, "hk-hkma-t01-t0101monetary-statistics");
  assert.equal(m3.latest_value, 20647395.229);
  assert.equal(m3.previous_value, 18796857.507);
  assert.equal(m3.comparison_period_label, "2025年1月");

  const m3Ui = uiCard.metrics.find((item: any) => item.id === "money_supply_m3");
  assert.equal(m3Ui.display_value_text, "20.6萬億");
  assert.equal(m3Ui.display_change_text, "較去年同期（2025年1月） +9.8%");
});
