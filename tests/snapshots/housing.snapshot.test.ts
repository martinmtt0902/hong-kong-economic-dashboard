import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers/loadData";

test("housing snapshot restores live price and rent indices", () => {
  const payload = readJson<any>("public/data/dashboard.v2.json");

  const card = payload.cards.find((item: any) => item.id === "housing");

  const price = card.metrics.find((item: any) => item.id === "private_price_index");
  assert.equal(price.validation_state, "ok");
  assert.equal(price.as_of_label, "2026年1月");
  assert.ok(price.latest_value > 300);

  const rent = card.metrics.find((item: any) => item.id === "private_rent_index");
  assert.equal(rent.validation_state, "ok");
  assert.equal(rent.as_of_label, "2026年1月");
  assert.ok(rent.latest_value > 200);
});
