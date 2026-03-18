import { formatTimestamp } from "../lib/format";
import type { DashboardCard as DashboardCardType } from "../types";
import { MetricRow } from "./MetricRow";

export function DashboardCard({ card }: { card: DashboardCardType }) {
  const latestLabel = card.latest_data_label ?? formatTimestamp(card.latest_data_at);
  const headerMeta = card.periods_summary_text_tc ?? (latestLabel ? `資料更新至 ${latestLabel}` : undefined);

  return (
    <section className="dashboard-card">
      <header className="card-header">
        <div>
          <h2>{card.title_tc}</h2>
          {card.card_status_text_tc ? <p className="card-status">{card.card_status_text_tc}</p> : null}
        </div>
        {headerMeta ? <p className="card-updated">{headerMeta}</p> : null}
      </header>

      <div className="card-body">
        {card.metrics.map((metric) => (
          <MetricRow key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}
