import { FreshnessBadge } from "./FreshnessBadge";
import { Sparkline } from "./Sparkline";
import type { UIMetricRow } from "../types";

export function MetricRow({ metric }: { metric: UIMetricRow }) {
  return (
    <article className="metric-row">
      <div className="metric-copy">
        <div className="metric-heading">
          <h3>{metric.label_tc}</h3>
          <FreshnessBadge state={metric.status} />
        </div>
        <div className="metric-value">{metric.display_value_text}</div>
        <div className="metric-subline">{metric.display_change_text}</div>
        <div className="metric-previous">{metric.display_previous_text}</div>
      </div>

      <div className="metric-chart">
        <Sparkline points={metric.sparkline_points} />
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
