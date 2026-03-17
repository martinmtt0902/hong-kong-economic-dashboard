import { FreshnessBadge } from "./FreshnessBadge";
import { Sparkline } from "./Sparkline";
import {
  formatChange,
  formatMetricValue,
  formatPeriodLabel,
  formatPrevious
} from "../lib/format";
import type { MetricSeries } from "../types";

export function MetricRow({ metric }: { metric: MetricSeries }) {
  return (
    <article className="metric-row">
      <div className="metric-copy">
        <div className="metric-heading">
          <h3>{metric.label_tc}</h3>
          <FreshnessBadge state={metric.freshness} />
        </div>
        <div className="metric-value">{formatMetricValue(metric.latest, metric.unit)}</div>
        <div className="metric-subline">{formatChange(metric)}</div>
        <div className="metric-previous">{formatPrevious(metric)}</div>
      </div>

      <div className="metric-chart">
        <Sparkline points={metric.sparkline_points} />
      </div>

      <div className="metric-meta">
        <span className="period-chip">
          {formatPeriodLabel(metric.latest, metric.frequency)}
        </span>
        <a href={metric.source_url} target="_blank" rel="noreferrer">
          官方來源
        </a>
      </div>
    </article>
  );
}
