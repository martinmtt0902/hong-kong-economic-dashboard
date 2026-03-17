import { formatTimestamp } from "../lib/format";
import type { DashboardCard as DashboardCardType } from "../types";
import { MetricRow } from "./MetricRow";

export function DashboardCard({ card }: { card: DashboardCardType }) {
  return (
    <section className="dashboard-card">
      <header className="card-header">
        <div>
          <p className="card-eyebrow">Official Tracker</p>
          <h2>{card.title_tc}</h2>
        </div>
        <p className="card-updated">資料更新至 {formatTimestamp(card.latest_data_at)}</p>
      </header>

      <div className="card-body">
        {card.metrics.map((metric) => (
          <MetricRow key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}
