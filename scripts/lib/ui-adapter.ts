import { latestCardMetric } from "./transform";
import type { DashboardCard, DashboardPayload, DashboardPayloadV2, TransformedMetric, UIMetricRow, ValidationState } from "./types";

const statusTextMap: Record<ValidationState, string> = {
  ok: "最新",
  data_error: "資料異常",
  needs_review: "待核對",
  schema_changed: "來源欄位變更",
  source_error: "來源暫時不可用",
  stale: "待官方更新"
};

export function toDashboardPayload(payloadV2: DashboardPayloadV2): DashboardPayload {
  return {
    generated_at: payloadV2.generated_at,
    cards: payloadV2.cards.map((card) => {
      const latestMetric = latestCardMetric(card.metrics);
      const hasOnlyIssues = card.metrics.every((metric) => metric.validation_state !== "ok");

      return {
        id: card.id,
        title_tc: card.title_tc,
        latest_data_at: latestMetric?.as_of_date,
        latest_data_label: latestMetric?.as_of_label,
        card_status_text_tc: hasOnlyIssues ? "資料待核對" : undefined,
        metrics: card.metrics.map(toUIMetricRow)
      } satisfies DashboardCard;
    })
  };
}

export function toUIMetricRow(metric: TransformedMetric): UIMetricRow {
  const canRenderPreservedValue =
    metric.validation_state !== "data_error" &&
    typeof metric.latest_value === "number";

  if (!canRenderPreservedValue) {
    return {
      id: metric.id,
      label_tc: metric.label_tc,
      source_name: metric.source.publisher,
      source_url: metric.source.dataset_url,
      source_note: metric.source_note,
      status: metric.validation_state,
      status_text_tc: statusTextMap[metric.validation_state],
      display_value_text: statusTextMap[metric.validation_state],
      display_change_text: metric.validation_messages[0]?.message_tc ?? "請核對官方來源",
      display_previous_text: "請核對官方來源",
      display_period_text: metric.as_of_label || "待官方更新",
      display_comparison_basis_text: metric.comparison_basis_label_tc,
      sparkline_points: [],
      expected_update: metric.expected_update
    };
  }

  return {
    id: metric.id,
    label_tc: metric.label_tc,
    source_name: metric.source.publisher,
    source_url: metric.source.dataset_url,
    source_note: metric.source_note,
    status: metric.validation_state,
    status_text_tc: statusTextMap[metric.validation_state],
    display_value_text: formatValue(metric.latest_value, metric.unit, metric.metric_type),
    display_change_text: formatChange(metric),
    display_previous_text: formatPrevious(metric),
    display_period_text: metric.as_of_label,
    display_comparison_basis_text: metric.comparison_basis_label_tc,
    sparkline_points:
      metric.validation_state === "data_error"
        ? []
        : metric.sparkline_points.map((point) => ({ x: point.as_of_label, y: point.value })),
    expected_update: metric.expected_update
  };
}

function formatValue(value: number | undefined, unit: string, metricType: TransformedMetric["metric_type"]): string {
  if (typeof value !== "number") {
    return "待官方更新";
  }

  if (metricType === "yoy_percent" || metricType === "qoq_percent") {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  }

  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }

  if (unit === "港元/小時") {
    return `HK$${value.toFixed(1)}`;
  }

  if (unit === "百萬港元") {
    return `HK$${(value / 100).toFixed(1)}億`;
  }

  if (unit === "指數" || unit === "歲") {
    return value.toFixed(1);
  }

  return new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: 1
  }).format(value);
}

function formatChange(metric: TransformedMetric): string {
  if (typeof metric.change_value !== "number") {
    return "沒有可比較期";
  }

  switch (metric.change_type) {
    case "percentage_point_change":
      return `${metric.comparison_basis_label_tc} ${metric.change_value >= 0 ? "+" : ""}${metric.change_value.toFixed(1)} 個百分點`;
    case "absolute_change":
      return `${metric.comparison_basis_label_tc} ${metric.change_value >= 0 ? "+" : ""}${formatPlainNumber(metric.change_value)}`;
    case "yoy_percent":
    case "qoq_percent":
      return `${metric.comparison_basis_label_tc} ${metric.change_value >= 0 ? "+" : ""}${metric.change_value.toFixed(1)}%`;
    case "none":
      return metric.comparison_basis_label_tc;
    default:
      return metric.comparison_basis_label_tc;
  }
}

function formatPrevious(metric: TransformedMetric): string {
  if (typeof metric.previous_value !== "number") {
    return "沒有可比較期";
  }
  return `${previousBasisText(metric.comparison_basis_label_tc)} ${formatValue(metric.previous_value, metric.unit, metric.metric_type)}`;
}

function previousBasisText(basisLabel: string): string {
  return basisLabel.replace(/^較/, "");
}

function formatPlainNumber(value: number): string {
  return new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: 1
  }).format(value);
}
