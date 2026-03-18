import { FreshnessBadge } from "./FreshnessBadge";
import { Sparkline } from "./Sparkline";
import type { UIMetricRow } from "../types";

export function MetricRow({ metric }: { metric: UIMetricRow }) {
  const badgeLabel =
    metric.data_origin === "live"
      ? undefined
      : metric.data_origin === "last_successful_snapshot"
        ? "上次成功抓取值"
        : metric.data_origin === "last_verified_snapshot"
          ? "最後核實值"
          : undefined;

  return (
    <article className="metric-row">
      <div className="metric-copy">
        <div className="metric-heading">
          <h3>{metric.label_tc}</h3>
          {metric.data_origin !== "live" || metric.status !== "ok" ? (
            <FreshnessBadge state={metric.status} label={badgeLabel} />
          ) : null}
        </div>
        <div className="metric-value">{metric.display_value_text}</div>
        <div className="metric-subline">{metric.display_comparison_text}</div>
        <div className="metric-previous">{metric.display_previous_text}</div>
        {metric.reason ? <div className="metric-previous">{metric.reason}</div> : null}
        {metric.last_successful_fetch_at ? <div className="metric-previous">最近成功抓取：{metric.last_successful_fetch_at}</div> : null}
      </div>

      <div className="metric-chart">
        <Sparkline chart={metric.chart} />
      </div>

      <div className="metric-meta">
        <span className="period-chip">{metric.display_period_text}</span>
        <span className="comparison-chip">{metric.display_comparison_basis_text}</span>
        <a href={metric.source_url} target="_blank" rel="noreferrer">
          官方來源
        </a>
      </div>
    </article>
  );
}
