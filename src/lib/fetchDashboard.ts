import type { DashboardManifest, DashboardPayload } from "../types";

export async function fetchDashboard(): Promise<{
  dashboard: DashboardPayload;
  manifest?: DashboardManifest;
}> {
  const [dashboardResponse, manifestResponse] = await Promise.all([
    fetch("./data/dashboard.json"),
    fetch("./data/manifest.json").catch(() => null)
  ]);

  if (!dashboardResponse.ok) {
    throw new Error(`無法載入 dashboard.json (${dashboardResponse.status})`);
  }

  const dashboard = (await dashboardResponse.json()) as DashboardPayload;
  const manifest =
    manifestResponse && manifestResponse.ok
      ? ((await manifestResponse.json()) as DashboardManifest)
      : undefined;

  return { dashboard, manifest };
}
