import type { MetricStatus } from "../types";

const labelMap: Record<MetricStatus, string> = {
  ok: "最新",
  data_error: "資料異常",
  needs_review: "待核對",
  schema_changed: "來源欄位變更",
  source_error: "來源暫時不可用",
  stale: "待官方更新"
};

export function FreshnessBadge({ state, label }: { state: MetricStatus; label?: string }) {
  return <span className={`badge badge-${state}`}>{label ?? labelMap[state]}</span>;
}
