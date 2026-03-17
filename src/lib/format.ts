import type { DataPoint, Frequency, MetricSeries } from "../types";

const dateFormatter = new Intl.DateTimeFormat("zh-Hant-HK", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100000000) {
    return `${(value / 100000000).toFixed(1)}億`;
  }
  if (abs >= 10000) {
    return `${(value / 10000).toFixed(1)}萬`;
  }
  return new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: 1
  }).format(value);
}

function formatHongKongDollarMillions(value: number): string {
  const fullValue = value * 1000000;
  const abs = Math.abs(fullValue);
  if (abs >= 100000000) {
    return `HK$${(fullValue / 100000000).toFixed(1)}億`;
  }
  if (abs >= 10000) {
    return `HK$${(fullValue / 10000).toFixed(1)}萬`;
  }
  return `HK$${new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: 0
  }).format(fullValue)}`;
}

export function formatMetricValue(point: DataPoint | undefined, unit: string): string {
  if (!point) {
    return "待抓取";
  }

  if (unit.includes("%")) {
    return `${point.value.toFixed(1)}%`;
  }

  if (unit === "港元/小時") {
    return `HK$${point.value.toFixed(1)}`;
  }

  if (unit === "指數") {
    return point.value.toFixed(1);
  }

  if (unit === "百萬港元") {
    return formatHongKongDollarMillions(point.value);
  }

  return `${formatCompactNumber(point.value)}${unit === "人" ? "" : unit}`;
}

export function formatChange(metric: MetricSeries): string {
  if (!metric.latest || !metric.previous) {
    return "沒有可比較期";
  }

  const abs = metric.change_abs ?? metric.latest.value - metric.previous.value;
  const pct = metric.change_pct;

  if (metric.unit.includes("%")) {
    return `${abs >= 0 ? "+" : ""}${abs.toFixed(1)} 個百分點`;
  }

  if (typeof pct === "number" && Number.isFinite(pct)) {
    return `${abs >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  }

  return `${abs >= 0 ? "+" : ""}${formatCompactNumber(abs)}`;
}

export function formatPrevious(metric: MetricSeries): string {
  if (!metric.previous) {
    return "上期數值未提供";
  }

  return `上期 ${formatMetricValue(metric.previous, metric.unit)}`;
}

export function formatPeriodLabel(point: DataPoint | undefined, frequency: Frequency): string {
  if (!point) {
    return "待官方更新";
  }

  if (point.label_tc) {
    return point.label_tc;
  }

  switch (frequency) {
    case "monthly":
      return point.period_key;
    case "quarterly":
      return point.period_key;
    case "annual":
      return point.period_key;
    case "event":
      return point.period_key;
    default:
      return point.period_key;
  }
}

export function formatTimestamp(value: string | undefined): string {
  if (!value) {
    return "未提供";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
