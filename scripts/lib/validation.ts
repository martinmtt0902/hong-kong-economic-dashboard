import type { MetricDefinitionRecord } from "./metric-definition";
import type { RawObservation, TransformedMetric, ValidationMessage, ValidationState } from "./types";

export function validateTransformedMetric(
  metric: TransformedMetric,
  definition: MetricDefinitionRecord,
  primarySeries: RawObservation[],
  auxiliarySeries: RawObservation[] = []
): Pick<TransformedMetric, "validation_state" | "validation_messages"> {
  const messages: ValidationMessage[] = [];
  const latestValue = metric.latest_value;
  const year = extractNumericYear(metric.as_of_label);

  if (typeof latestValue !== "number") {
    messages.push({
      code: "source_missing",
      level: "error",
      message_tc: "來源暫時沒有可用數據。"
    });
  }

  if (typeof latestValue === "number" && definition.validation?.min !== undefined && latestValue < definition.validation.min) {
    messages.push({
      code: "value_out_of_range",
      level: "error",
      message_tc: `數值低於合理區間下限（${definition.validation.min}）。`
    });
  }

  if (typeof latestValue === "number" && definition.validation?.max !== undefined && latestValue > definition.validation.max) {
    messages.push({
      code: "value_out_of_range",
      level: "error",
      message_tc: `數值高於合理區間上限（${definition.validation.max}）。`
    });
  }

  if (typeof latestValue === "number" && definition.validation?.disallow_year_value && typeof year === "number" && latestValue === year) {
    messages.push({
      code: "year_used_as_value",
      level: "error",
      message_tc: "來源值疑似誤把年份當成數值。"
    });
  }

  if (typeof latestValue === "number" && definition.validation?.disallow_three_digit && Math.abs(latestValue) < 1000) {
    messages.push({
      code: "value_out_of_range",
      level: "error",
      message_tc: "來源值疑似縮錯單位，只剩三位數。"
    });
  }

  if (typeof metric.change_value === "number" && definition.validation?.compare_auxiliary_delta_max !== undefined && auxiliarySeries.length > 0) {
    const auxiliaryLatest = auxiliarySeries.at(-1);
    if (auxiliaryLatest) {
      const diff = Math.abs(metric.change_value - auxiliaryLatest.value);
      if (diff > definition.validation.compare_auxiliary_delta_max) {
        messages.push({
          code: "measure_mismatch",
          level: "warning",
          message_tc: "與官方輔助同比序列不一致，待核對。"
        });
      }
    }
  }

  if (metric.metric_type === "yoy_percent" && primarySeries.some((row) => row.measure_label_tc.includes("按年變動百分率")) && metric.change_type === "yoy_percent") {
    messages.push({
      code: "double_yoy_detected",
      level: "error",
      message_tc: "偵測到可能對按年變動序列再次做同比計算。"
    });
  }

  if (!metric.sparkline_definition.series_id) {
    messages.push({
      code: "source_missing",
      level: "error",
      message_tc: "Sparkline 定義缺失。"
    });
  }

  return {
    validation_state: inferValidationState(messages),
    validation_messages: messages
  };
}

export function inferValidationState(messages: ValidationMessage[]): ValidationState {
  if (messages.some((message) => message.code === "schema_changed")) {
    return "schema_changed";
  }
  if (messages.some((message) => message.level === "error")) {
    return "data_error";
  }
  if (messages.some((message) => message.level === "warning")) {
    return "needs_review";
  }
  return "ok";
}

function extractNumericYear(label: string): number | undefined {
  const match = label.match(/(?<!\d)(\d{4})(?!\d)/);
  return match ? Number(match[1]) : undefined;
}
