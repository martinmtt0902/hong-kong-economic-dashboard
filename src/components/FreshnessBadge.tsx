import type { FreshnessState } from "../types";

const labelMap: Record<FreshnessState, string> = {
  fresh: "最新",
  stale: "待官方更新",
  failed: "更新失敗",
  empty: "待抓取"
};

export function FreshnessBadge({ state }: { state: FreshnessState }) {
  return <span className={`badge badge-${state}`}>{labelMap[state]}</span>;
}
