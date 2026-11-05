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
