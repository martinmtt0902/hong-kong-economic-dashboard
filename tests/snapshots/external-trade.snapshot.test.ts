import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("external trade snapshot uses official merchandise trade totals and sign-aware balance text", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");

  const card = payload.cards.find((item: any) => item.id === "external-trade");
  const uiCard = ui.cards.find((item: any) => item.id === "external-trade");

  assert.equal(card.latest_as_of_label, "2026年1月");

  const exportsValue = card.metrics.find((item: any) => item.id === "total_exports_value");
  assert.equal(exportsValue.dataset_id, "hk-censtatd-tablechart-410-50001");
  assert.equal(exportsValue.latest_value, 520564);
  assert.equal(exportsValue.previous_value, 389142);
  assert.equal(exportsValue.comparison_period_label, "2025年1月");

  const importsValue = card.metrics.find((item: any) => item.id === "imports_value");
  assert.equal(importsValue.latest_value, 534659);
  assert.equal(importsValue.previous_value, 387064);

  const tradeBalance = card.metrics.find((item: any) => item.id === "visible_trade_balance");
  assert.equal(tradeBalance.latest_value, -14094);
  assert.equal(tradeBalance.previous_value, 2078);
  assert.equal(tradeBalance.balance_change_narrative, "surplus_to_deficit");
  assert.equal(tradeBalance.display_change_narrative_text, "較去年同月（2025年1月） 由順差轉為逆差 161.7億");

  const tradeBalanceUi = uiCard.metrics.find((item: any) => item.id === "visible_trade_balance");
  assert.equal(tradeBalanceUi.display_value_text, "逆差 140.9億");
  assert.equal(tradeBalanceUi.display_previous_text, "去年同月（2025年1月） 順差 20.8億");
});
