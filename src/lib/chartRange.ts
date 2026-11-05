import type { UIChart, UIChartPoint } from "../types";

export type ChartRange = 1 | 3 | 7 | 10;
type PeriodUnit = "month" | "quarter" | "year";
type DatedPoint = UIChartPoint & { date: string; slot: number; axisLabel: string };

function datedPoints(chart: UIChart) {
  return chart.points.flatMap((point) => {
    const date = point.date ?? (/^\d{4}-\d{2}-\d{2}$/.test(point.x) ? point.x : undefined);
    return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? [{ ...point, date }] : [];
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function availableChartRanges(chart: UIChart): ChartRange[] {
  const points = datedPoints(chart);
  const lastYear = Number(points.at(-1)?.date.slice(0, 4));
  const years = new Set(points.map((point) => Number(point.date.slice(0, 4))).filter((year) => year >= lastYear - 9));
  return [1, 3, years.size === 10 ? 10 : 7];
}

// Period-end samples retain their original observation and tooltip. They are
// never presented as period averages or totals, and missing periods stay empty.
export function selectChartRange(chart: UIChart, requestedYears: ChartRange) {
  const dated = datedPoints(chart);
  const years = requestedYears === 10 && !availableChartRanges(chart).includes(10) ? 7 : requestedYears;
  const latest = dated.at(-1);
  if (!latest) return { points: [] as DatedPoint[], ticks: [] as DatedPoint[], start: 0, end: 1, years, unit: "year" as PeriodUnit, note: "沒有可用歷史資料" };

  function period(date: string, unit: PeriodUnit) {
    const year = Number(date.slice(0, 4)), month = Number(date.slice(5, 7));
    return unit === "year" ? year : unit === "quarter" ? year * 4 + Math.floor((month - 1) / 3) : year * 12 + month - 1;
  }
  function countPeriods(unit: PeriodUnit, count: number) {
    const end = period(latest!.date, unit);
    return new Set(dated.map((point) => period(point.date, unit)).filter((slot) => slot > end - count && slot <= end)).size;
  }

  let unit: PeriodUnit = "year";
  let count: number = years;
  if (years === 1 && chart.frequency !== "annual") {
    unit = countPeriods("month", 12) === 12 ? "month" : "quarter";
    count = unit === "month" ? 12 : 4;
  } else if (years === 3 && chart.frequency !== "annual" && countPeriods("quarter", 12) === 12) {
    unit = "quarter";
    count = 12;
  }
  const end = period(latest.date, unit), start = end - count + 1;
  const buckets = new Map<number, DatedPoint>();
  for (const point of dated) {
    const slot = period(point.date, unit);
    if (slot < start || slot > end) continue;
    const axisLabel = unit === "year" ? point.date.slice(0, 4) : unit === "month" ? `${Number(point.date.slice(5, 7))}月` : `${point.date.slice(2, 4)}Q${slot % 4 + 1}`;
    buckets.set(slot, { ...point, slot, axisLabel });
  }
  const points = [...buckets.values()];
  const tickCount = Math.min(6, points.length);
  const ticks = Array.from({ length: tickCount }, (_, i) => points[tickCount === 1 ? 0 : Math.round(i * (points.length - 1) / (tickCount - 1))]);
  const coverage = `${dated[0].tooltip_title} – ${latest.tooltip_title}`;
  const sampling = unit === "year" ? "每年最後可用一期（不另計總和或平均）" : unit === "quarter" ? "每季最後可用一期（不另計總和或平均）" : "每月最後可用一期";
  const fallback = years === 7 ? "不足十年，最長顯示七年；" : "";
  return { points, ticks, start, end, years, unit, note: `${fallback}${sampling}；缺期不補值。已載入：${coverage}` };
}
