import test from "node:test";
import assert from "node:assert/strict";
import { fetchHkmaHistory } from "../../scripts/fetch/hkma";
import { fetchBirthsRegistrationObservations } from "../../scripts/fetch/birthsRegistration";
import { metricDefinitions } from "../../scripts/lib/metric-definition";

test("HKMA pagination requests all three pages without stopping at the default 100 rows", async () => {
  const original = globalThis.fetch;
  const offsets: string[] = [];
  globalThis.fetch = (async (input: any) => {
    const url = new URL(String(input));
    offsets.push(url.searchParams.get("offset")!);
    assert.equal(url.searchParams.get("pagesize"), "1000");
    return new Response(JSON.stringify({ result: { records: Array.from({ length: 1000 }, (_, i) => ({ n: i + Number(url.searchParams.get("offset")) })) } }));
  }) as typeof fetch;
  try {
    const records = await fetchHkmaHistory("https://example.test/hkma", "end_of_date", 3);
    assert.equal(records.length, 3000);
    assert.deepEqual(offsets, ["0", "1000", "2000"]);
  } finally { globalThis.fetch = original; }
});

test("birth registrations decode the official Big5 header and use live revised values", async () => {
  const original = globalThis.fetch;
  // Official header: 年份,出生登記數目 (Big5).
  const header = Buffer.from("a67ea5f72ca558a5cdb56eb04fbcc6a5d80d0a", "hex");
  const bytes = Buffer.concat([header, Buffer.from("2024,36767\r\n2025,31714\r\n")]);
  globalThis.fetch = (async () => new Response(bytes)) as typeof fetch;
  try {
    const definition = metricDefinitions.find((d) => d.metric.id === "live_births")!.metric;
    const rows = await fetchBirthsRegistrationObservations("https://example.test/births", definition.source, definition.label_tc);
    assert.equal(rows.at(-1)!.value, 31714);
    assert.equal(rows.at(-1)!.as_of_date, "2025-12-31");
  } finally { globalThis.fetch = original; }
});

import { fetchM3Observations } from "../../scripts/fetch/hkma";
test("M3 combines older official year-end history with unchanged recent monthly values", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: any) => {
    const url = String(input);
    if (url.includes("censtatd")) {
      return new Response(JSON.stringify({ dataSet: [2020, 2021, 2022, 2023, 2024, 2025].map((year) => ({ freq: "Y", period: String(year), sv: "M3", svDesc: "百萬港元", figure: year })) }));
    }
    return new Response(JSON.stringify({ result: { records: [
      { end_of_month: "2026-09", m3_total: 22317143.681 },
      { end_of_month: "2025-12", m3_total: 21000000 },
      { end_of_month: "2025-08", m3_total: 20000000 },
      { end_of_month: "2024-00", m3_total: 999 }
    ] } }));
  }) as typeof fetch;
  try {
    const definition = metricDefinitions.find((d) => d.metric.id === "money_supply_m3")!.metric;
    const rows = await fetchM3Observations(definition.source, definition.label_tc);
    assert.equal(rows.at(-1)!.value, 22317143.681);
    assert.equal(rows.find((p) => p.as_of_date === "2025-12-31")!.value, 21000000);
    assert.equal(rows.find((p) => p.as_of_date === "2020-12-31")!.frequency, "annual");
    assert.equal(new Set(rows.map((p) => p.as_of_date.slice(0, 4))).size, 7);
    assert.ok(!rows.some((p) => p.value === 999));
  } finally { globalThis.fetch = original; }
});
