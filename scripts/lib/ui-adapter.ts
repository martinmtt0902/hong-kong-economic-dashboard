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
      const hasOnlyIssues = card.metrics.every((metric) => metric.validation_state !== "ok");
      const uniquePeriods = [...new Set(card.metrics.map((metric) => metric.as_of_label).filter(Boolean))];
      const hasMixedPeriods = uniquePeriods.length > 1;

      return {
        id: card.id,
        title_tc: card.title_tc,
        latest_data_at: hasMixedPeriods ? undefined : card.latest_as_of_date,
        latest_data_label: hasMixedPeriods ? undefined : card.latest_as_of_label,
        periods_summary_text_tc: hasMixedPeriods ? "各卡更新期不同，請以各列期別為準" : undefined,
        card_status_text_tc: hasOnlyIssues ? "資料待核對" : undefined,
        metrics: card.metrics.map(toUIMetricRow)
      } satisfies DashboardCard;
    })
  };
}

export function toUIMetricRow(metric: TransformedMetric): UIMetricRow {
  const canRenderPreservedValue = metric.data_origin !== "status_only" && typeof metric.latest_value === "number";

  if (!canRenderPreservedValue) {
    return {
      id: metric.id,
      label_tc: metric.label_tc,
      source_name: metric.source.publisher,
      source_url: metric.source.dataset_url,
      source_note: metric.source_note,
      status: metric.validation_state,
      status_text_tc: statusText(metric),
      display_value_text: statusText(metric),
      display_change_text: metric.validation_messages[0]?.message_tc ?? "請核對官方來源",
      display_previous_text: "請核對官方來源",
      display_period_text: metric.as_of_label || "待官方更新",
      display_comparison_text: metric.comparison_basis_label_tc,
      display_comparison_basis_text: metric.comparison_basis_label_tc,
      display_comparison_period_text: metric.comparison_period_label,
      display_unit: metric.display_unit,
      data_origin: metric.data_origin,
      last_successful_fetch_at: metric.last_successful_fetch_at,
      reason: metric.reason,
      chart: {
        chart_type: metric.chart_definition.chart_type,
        x_axis_label: metric.chart_definition.x_axis_label,
        y_axis_label: metric.chart_definition.y_axis_label,
        time_label: metric.chart_definition.time_label,
        value_label: metric.chart_definition.value_label,
        display_unit: metric.chart_definition.display_unit,
        chart_value_transform: metric.chart_definition.chart_value_transform,
        suggested_ticks: metric.chart_definition.suggested_ticks,
        points: []
      },
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
    status_text_tc: statusText(metric),
    display_value_text: formatValue(metric.latest_value, metric, "value"),
    display_change_text: formatChange(metric),
    display_previous_text: formatPrevious(metric),
    display_period_text: metric.as_of_label,
    display_comparison_text: formatChange(metric),
    display_comparison_basis_text: metric.comparison_basis_label_tc,
    display_comparison_period_text: metric.comparison_period_label,
    display_unit: metric.display_unit,
    data_origin: metric.data_origin,
    last_successful_fetch_at: metric.last_successful_fetch_at,
    reason: metric.reason,
      chart: {
        chart_type: metric.chart_definition.chart_type,
        x_axis_label: metric.chart_definition.x_axis_label,
        y_axis_label: metric.chart_definition.y_axis_label,
        time_label: metric.chart_definition.time_label,
        value_label: metric.chart_definition.value_label,
        display_unit: metric.chart_definition.display_unit,
        chart_value_transform: metric.chart_definition.chart_value_transform,
        suggested_ticks: metric.chart_definition.suggested_ticks,
        points: metric.chart_points.map((point) => ({
          x: point.as_of_label,
          y: point.value * metric.chart_definition.chart_value_transform.scale,
          tick_label: point.tick_label,
          tooltip_title: point.tooltip_title,
          tooltip_value_text: point.tooltip_value_text
        }))
      },
    sparkline_points: metric.chart_points.map((point) => ({ x: point.as_of_label, y: point.value })),
    expected_update: metric.expected_update
  };
}

function statusText(metric: TransformedMetric): string {
  if (metric.data_origin === "last_successful_snapshot") {
    return "上次成功抓取值";
  }
  if (metric.data_origin === "last_verified_snapshot") {
    return "最後核實值";
  }
  return statusTextMap[metric.validation_state];
}

function formatValue(value: number | undefined, metric: TransformedMetric, mode: "value" | "previous" | "change"): string {
  if (typeof value !== "number") {
    return "待官方更新";
  }

  const decimals =
    mode === "change"
      ? metric.rounding_policy.change_decimals
      : mode === "previous"
        ? metric.rounding_policy.previous_decimals
        : metric.rounding_policy.value_decimals;
  const scaled = metric.rounding_policy.display_scale ? value * metric.rounding_policy.display_scale : value;

  if (metric.metric_type === "yoy_percent" || metric.metric_type === "qoq_percent") {
    return `${scaled >= 0 ? "+" : ""}${scaled.toFixed(decimals)}%`;
  }

  if (metric.display_unit === "%") {
    return `${scaled.toFixed(decimals)}%`;
  }

  if (metric.display_unit === "HK$/小時") {
    return `HK$${scaled.toFixed(decimals)}/小時`;
  }

  if (metric.display_unit === "億港元") {
    return `${scaled.toFixed(decimals)}億`;
  }

  if (metric.display_unit === "歲") {
    return `${scaled.toFixed(decimals)} 歲`;
  }

  if (metric.display_unit === "指數") {
    return scaled.toFixed(decimals);
  }

  return new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(scaled);
}

function formatChange(metric: TransformedMetric): string {
  if (typeof metric.change_value !== "number") {
    return "沒有可比較期";
  }

  const prefix = `${metric.comparison_basis_label_tc}${metric.comparison_period_label ? `（${metric.comparison_period_label}）` : ""}`;
  const sign = metric.change_value >= 0 ? "+" : "";
  const scaled =
    metric.change_type === "absolute_change" && metric.rounding_policy.display_scale
      ? metric.change_value * metric.rounding_policy.display_scale
      : metric.change_value;

  switch (metric.change_type) {
    case "percentage_point_change":
      return `${prefix} ${sign}${scaled.toFixed(metric.rounding_policy.change_decimals)} 個百分點`;
    case "absolute_change":
      if (metric.display_unit === "HK$/小時") {
        return `${prefix} ${sign}HK$${scaled.toFixed(metric.rounding_policy.change_decimals)}/小時`;
      }
      if (metric.display_unit === "億港元") {
        return `${prefix} ${sign}${scaled.toFixed(metric.rounding_policy.change_decimals)}億`;
      }
      if (metric.display_unit === "歲") {
        return `${prefix} ${sign}${scaled.toFixed(metric.rounding_policy.change_decimals)} 歲`;
      }
      return `${prefix} ${sign}${new Intl.NumberFormat("zh-Hant-HK", {
        maximumFractionDigits: metric.rounding_policy.change_decimals,
        minimumFractionDigits: metric.rounding_policy.change_decimals
      }).format(scaled)}`;
    case "yoy_percent":
    case "qoq_percent":
      return `${prefix} ${sign}${scaled.toFixed(metric.rounding_policy.change_decimals)}%`;
    case "none":
      return prefix;
    default:
      return prefix;
  }
}

function formatPrevious(metric: TransformedMetric): string {
  if (typeof metric.previous_value !== "number") {
    return "沒有可比較期";
  }

  const label = previousBasisText(metric.comparison_basis_label_tc);
  const period = metric.comparison_period_label ? `（${metric.comparison_period_label}）` : "";
  return `${label}${period} ${formatValue(metric.previous_value, metric, "previous")}`;
}

function previousBasisText(basisLabel: string): string {
  return basisLabel.replace(/^較/, "");
}
