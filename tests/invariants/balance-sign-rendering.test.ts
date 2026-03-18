import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("balance metrics preserve numeric delta but render sign-aware narratives", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");
  const ui = readJson<any>("public/data/dashboard.json");
  const metrics = payload.cards.flatMap((card: any) => card.metrics);

  const tradeBalance = metrics.find((item: any) => item.id === "visible_trade_balance");
  assert.equal(typeof tradeBalance.raw_change_value, "number");
  assert.equal(tradeBalance.balance_change_narrative, "surplus_to_deficit");
  assert.match(tradeBalance.display_change_narrative_text, /由順差轉為逆差/);

  const currentAccount = metrics.find((item: any) => item.id === "current_account_balance");
  assert.equal(typeof currentAccount.raw_change_value, "number");
  assert.equal(currentAccount.balance_change_narrative, "surplus_increased");
  assert.match(currentAccount.display_change_narrative_text, /順差增加/);

  const tradeBalanceUi = ui.cards
    .find((item: any) => item.id === "external-trade")
    .metrics.find((item: any) => item.id === "visible_trade_balance");
  assert.match(tradeBalanceUi.display_value_text, /逆差/);
  assert.match(tradeBalanceUi.display_change_text, /由順差轉為逆差/);
});
