import { readFile, writeFile } from "node:fs/promises";
import { fetchJson } from "./lib/http";
import { dashboardPayloadV2Schema } from "./lib/types";

// Scheduled builds do not commit data. Restore the last deployment so a temporary
// source outage cannot silently revert a metric to the repository's old snapshot.
const file = "public/data/dashboard.v2.json";
try {
  const published = dashboardPayloadV2Schema.parse(await fetchJson("https://martinmtt0902.github.io/hong-kong-economic-dashboard/data/dashboard.v2.json"));
  const local = dashboardPayloadV2Schema.parse(JSON.parse(await readFile(file, "utf8")));
  const ids = (payload: typeof local) => payload.cards.flatMap((card) => card.metrics.map((metric) => metric.id)).sort().join(",");
  if (ids(published) !== ids(local)) throw new Error("Published metric list differs from this checkout");
  if (published.generated_at > local.generated_at) {
    await writeFile(file, `${JSON.stringify(published, null, 2)}\n`);
    console.log(`Restored published fallback from ${published.generated_at}`);
  }
} catch (error) {
  console.warn("Published fallback unavailable; retaining checked-in snapshot:", error instanceof Error ? error.message : error);
}
