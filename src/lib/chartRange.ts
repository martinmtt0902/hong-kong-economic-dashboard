import type { UIChart, UIChartPoint } from "../types";

export const chartRanges = [1, 3, 5, 7] as const;
export type ChartRange = (typeof chartRanges)[number];
type DatedPoint = UIChartPoint & { date: string; slot: number; axisLabel: string };

// Use calendar buckets, never observation counts: missing periods stay missing.
// Longer views show each year's last published observation, not an annual sum/mean.
export function selectChartRange(chart: UIChart, years: ChartRange) {
  const dated = chart.points.flatMap((point) => {
    const date = point.date ?? (/^\d{4}-\d{2}-\d{2}$/.test(point.x) ? point.x : undefined);
    return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? [{ ...point, date }] : [];
  }).sort((a, b) => a.date.localeCompare(b.date));
  const latest = dated.at(-1);
  if (!latest) return { points: [] as DatedPoint[], ticks: [] as DatedPoint[], start: 0, end: 1, note: "沒有可用歷史資料" };
  const latestYear = Number(latest.date.slice(0, 4));
  const latestMonth = latestYear * 12 + Number(latest.date.slice(5, 7)) - 1;
  const annual = years > 1 || chart.frequency === "annual";
  const start = annual ? latestYear - years + 1 : latestMonth - 11;
  const end = annual ? latestYear : latestMonth;
  const buckets = new Map<number, DatedPoint>();
  for (const point of dated) {
    const year = Number(point.date.slice(0, 4));
    const month = Number(point.date.slice(5, 7));
    const slot = annual ? year : year * 12 + month - 1;
    if (slot < start || slot > end) continue;
    buckets.set(slot, { ...point, slot, axisLabel: annual ? String(year) : `${month}月` });
  }
  const points = [...buckets.values()];
  // Seven year labels fit at the chart's minimum width; month labels alternate.
  const ticks = points.filter((_, i) => annual || i % 2 === 0 || i === points.length - 1);
  const coverage = `${dated[0].tooltip_title} – ${latest.tooltip_title}`;
  const sampling = annual ? "每年最後可用一期（非全年總數或平均）" : "每月最後可用一期；缺期不補值";
  return { points, ticks, start, end, note: `${sampling}。已載入：${coverage}` };
}
