import { useEffect, useState } from "react";
import { fetchDashboard } from "./lib/fetchDashboard";
import { formatTimestamp } from "./lib/format";
import { DashboardCard } from "./components/DashboardCard";
import type { DashboardPayload } from "./types";

function App() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchDashboard()
      .then(({ dashboard: payload }) => {
        setDashboard(payload);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "資料載入失敗");
      });
  }, []);

  if (error) {
    return (
      <main className="page-shell">
        <section className="hero">
          <p className="hero-kicker">香港官方經濟指標</p>
          <h1>載入資料時出現問題</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="page-shell">
        <section className="hero">
          <p className="hero-kicker">香港官方經濟指標</p>
          <h1>正在整理最新官方數據</h1>
          <p>系統正從已生成的 JSON 載入卡片資料。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="hero-kicker">香港官方經濟指標</p>
          <h1>每日自動更新的 9 格官方統計儀表板</h1>
        </div>
        <div className="hero-meta">
          <p>只採用官方來源，不直接引用非正式平台數據。</p>
          <p>網站更新於 {formatTimestamp(dashboard.generated_at)}</p>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="香港經濟與社會關鍵指標">
        {dashboard.cards.map((card) => (
          <DashboardCard key={card.id} card={card} />
        ))}
      </section>
    </main>
  );
}

export default App;
