import { useEffect, useState } from "react";
import { fetchDashboard } from "./lib/fetchDashboard";
import { formatTimestamp } from "./lib/format";
import { DashboardCard } from "./components/DashboardCard";
import type { DashboardPayload } from "./types";

const HKT_OFFSET_MS = 8 * 60 * 60 * 1000;
const HKT_UPDATE_HOURS = [10, 18];
const THEME_STORAGE_KEY = "official-tracker-theme";

type ThemeMode = "light" | "dark";

function App() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState<string>(() => formatCountdownToNextHktUpdate());
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    void fetchDashboard()
      .then(({ dashboard: payload }) => {
        setDashboard(payload);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "資料載入失敗");
      });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdownText(formatCountdownToNextHktUpdate());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
          <h1>Official Statistics Tracker</h1>
        </div>
        <div className="hero-meta">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            aria-label={theme === "light" ? "切換至夜間模式" : "切換至日間模式"}
            title={theme === "light" ? "切換至夜間模式" : "切換至日間模式"}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
          </button>
          <p>網站更新於 {formatTimestamp(dashboard.generated_at)}</p>
          <p>距離下次更新還有{countdownText}(時/分/秒)</p>
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

function formatCountdownToNextHktUpdate(now = new Date()): string {
  const nextUpdate = nextHktUpdate(now);
  const diffMs = Math.max(0, nextUpdate.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function nextHktUpdate(now: Date): Date {
  const hkNow = new Date(now.getTime() + HKT_OFFSET_MS);
  const year = hkNow.getUTCFullYear();
  const month = hkNow.getUTCMonth();
  const day = hkNow.getUTCDate();
  const currentHour = hkNow.getUTCHours();
  const currentMinute = hkNow.getUTCMinutes();
  const currentSecond = hkNow.getUTCSeconds();

  for (const hour of HKT_UPDATE_HOURS) {
    if (
      currentHour < hour ||
      (currentHour === hour && currentMinute === 0 && currentSecond === 0)
    ) {
      return new Date(Date.UTC(year, month, day, hour, 0, 0) - HKT_OFFSET_MS);
    }
  }

  return new Date(Date.UTC(year, month, day + 1, HKT_UPDATE_HOURS[0], 0, 0) - HKT_OFFSET_MS);
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
