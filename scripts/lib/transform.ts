import { formatComparisonPeriodLabel, formatTickLabel, frequencyRank } from "./period";
import type { MetricDefinitionRecord } from "./metric-definition";
import type {
  BalanceChangeNarrative,
  BalancePosition,
  ChartPoint,
  ComparisonBasis,
  RawObservation,
  TransformedMetric
} from "./types";
import { validateTransformedMetric } from "./validation";

type BuildMetricInput = {
  definition: MetricDefinitionRecord;
  primarySeries: RawObservation[];
  auxiliarySeries?: RawObservation[];
  referenceDate: string;
};

export function buildTransformedMetric(input: BuildMetricInput): TransformedMetric {
  const primarySeries = sortObservations(input.primarySeries);
  const auxiliarySeries = sortObservations(input.auxiliarySeries ?? []);
  const selectedSeries = selectSeriesForDefinition(primarySeries, input.definition.id, input.referenceDate);
  const latest = selectedSeries.at(-1);
  const previous = latest ? selectPreviousObservation(selectedSeries, latest, input.definition.comparison_basis) : undefined;
  const changeValue =
    latest && previous ? computeChangeValue(latest.value, previous.value, input.definition.change_type) : undefined;
  const rawChangeValue = latest && previous ? Number((latest.value - previous.value).toFixed(4)) : undefined;
  const chartSource =
    input.definition.sparkline_series_role === "auxiliary" && auxiliarySeries.length > 0 ? auxiliarySeries : selectedSeries;
  const chartPoints = buildChartPoints(chartSource, input.definition);
  const displayUnit = input.definition.display_unit ?? input.definition.unit;
  const roundingPolicy = input.definition.rounding_policy ?? {
    value_decimals: 0,
    change_decimals: 0,
    previous_decimals: 0
  };

  const baseMetric: TransformedMetric = {
    id: input.definition.id,
    card_id: input.definition.card_id,
    label_tc: input.definition.label_tc,
    source: input.definition.source,
    source_system: input.definition.source.source_system,
    dataset_id: input.definition.source.dataset_id,
    table_id: input.definition.source.table_id,
    ecode: input.definition.source.ecode,
    dataset_title: input.definition.source.dataset_title,
    statistical_framework: input.definition.source.statistical_framework,
    series_id: latest?.series_id ?? selectedSeries[0]?.series_id ?? input.definition.id,
    auxiliary_series_ids: auxiliarySeries.length > 0 ? [...new Set(auxiliarySeries.map((item) => item.series_id))] : undefined,
    metric_type: input.definition.metric_type,
    render_strategy: input.definition.render_strategy ?? "default",
    frequency: input.definition.frequency,
    unit: input.definition.unit,
    display_unit: displayUnit,
    rounding_policy: roundingPolicy,
    as_of_date: latest?.as_of_date ?? "",
    as_of_label: latest?.as_of_label ?? "",
    release_date: latest?.release_date,
    latest_value: latest?.value,
    previous_value: previous?.value,
    previous_as_of_date: previous?.as_of_date,
    previous_as_of_label: previous?.as_of_label,
    change_value: changeValue,
    raw_change_value: rawChangeValue,
    change_type: input.definition.change_type,
    comparison_type: input.definition.comparison_basis,
    comparison_basis: input.definition.comparison_basis,
    comparison_basis_label_tc: input.definition.comparison_basis_label_tc,
    comparison_period_label: previous
      ? formatComparisonPeriodLabel(previous.as_of_label, input.definition.comparison_basis, previous.period_raw)
      : undefined,
    data_origin: "live",
    chart_series: chartSource[0]?.series_id ?? latest?.series_id ?? input.definition.id,
    chart_metric_type: input.definition.sparkline_metric_type ?? input.definition.metric_type,
    chart_definition: {
      series_id: chartSource[0]?.series_id ?? latest?.series_id ?? input.definition.id,
      metric_type: input.definition.sparkline_metric_type ?? input.definition.metric_type,
      chart_type: input.definition.chart_type ?? "line",
      frequency: input.definition.frequency,
      unit: input.definition.unit,
      display_unit: displayUnit,
      chart_value_transform: {
        scale: roundingPolicy.display_scale ?? 1,
        raw_unit: input.definition.unit,
        display_unit: displayUnit
      },
      period_start: chartSource[0]?.as_of_date ?? "",
      period_end: chartSource.at(-1)?.as_of_date ?? "",
      x_axis_label: input.definition.chart_time_label ?? defaultTimeLabel(input.definition.frequency),
      y_axis_label: `${input.definition.chart_value_label ?? input.definition.label_tc} (${displayUnit})`,
      value_label: input.definition.chart_value_label ?? input.definition.label_tc,
      time_label: input.definition.chart_time_label ?? defaultTimeLabel(input.definition.frequency),
      suggested_ticks: buildSuggestedTicks(chartPoints)
    },
    chart_points: chartPoints,
    sparkline_definition: {
      series_id: chartSource[0]?.series_id ?? latest?.series_id ?? input.definition.id,
      metric_type: input.definition.sparkline_metric_type ?? input.definition.metric_type,
      comparison_basis: input.definition.comparison_basis,
      unit: input.definition.unit,
      frequency: input.definition.frequency
    },
    sparkline_points: chartPoints.map((point) => ({
      as_of_date: point.as_of_date,
      as_of_label: point.as_of_label,
      value: point.value
    })),
    validation_state: "ok",
    validation_messages: [],
    source_note: input.definition.source_note,
    expected_update: input.definition.expected_update,
    provisional: latest?.provisional
  };

  if (input.definition.render_strategy === "balance_sign_aware" && latest && previous) {
    const balanceState = buildBalanceNarrative(latest.value, previous.value, baseMetric);
    baseMetric.balance_position = balanceState.balance_position;
    baseMetric.previous_balance_position = balanceState.previous_balance_position;
    baseMetric.balance_change_narrative = balanceState.balance_change_narrative;
    baseMetric.display_change_narrative_text = balanceState.display_change_narrative_text;
  }

  if (input.definition.id === "statutory_minimum_wage_next" && latest) {
    baseMetric.reason = `將於 ${latest.as_of_label} 生效`;
  }

  const validation = validateTransformedMetric(baseMetric, input.definition, selectedSeries, auxiliarySeries);

  return {
    ...baseMetric,
    ...validation
  };
}

export function selectPreviousObservation(
  series: RawObservation[],
  latest: RawObservation,
  basis: ComparisonBasis
): RawObservation | undefined {
  if (basis === "same_period_last_year") {
    const target = previousYearSamePeriod(latest.as_of_date);
    return series.find((point) => point.as_of_date === target);
  }

  const index = series.findIndex((point) => point.as_of_date === latest.as_of_date);
  return index > 0 ? series[index - 1] : undefined;
}

export function computeChangeValue(latest: number, previous: number, changeType: TransformedMetric["change_type"]): number | undefined {
  switch (changeType) {
    case "absolute_change":
    case "percentage_point_change":
      return Number((latest - previous).toFixed(4));
    case "yoy_percent":
    case "qoq_percent":
      return previous === 0 ? undefined : Number((((latest - previous) / previous) * 100).toFixed(4));
    case "none":
      return undefined;
    default:
      return undefined;
  }
}

export function latestCardMetric(metrics: TransformedMetric[]): TransformedMetric | undefined {
  return metrics
    .filter((metric) => Boolean(metric.as_of_date))
    .sort((left, right) => {
      const byDate = left.as_of_date.localeCompare(right.as_of_date);
      if (byDate !== 0) {
        return byDate;
      }
      return frequencyRank(left.frequency) - frequencyRank(right.frequency);
    })
    .at(-1);
}

export function selectCardHeaderMetric(metrics: TransformedMetric[], priority: string[]): TransformedMetric | undefined {
  for (const metricId of priority) {
    const metric = metrics.find((item) => item.id === metricId && item.as_of_date);
    if (metric) {
      return metric;
    }
  }
  return latestCardMetric(metrics);
}

function buildChartPoints(series: RawObservation[], definition: MetricDefinitionRecord, limit = 12): ChartPoint[] {
  const displayUnit = definition.display_unit ?? definition.unit;
  const rounding = definition.rounding_policy ?? {
    value_decimals: 0,
    change_decimals: 0,
    previous_decimals: 0
  };

  return series.slice(-limit).map((point) => {
    const displayValue = formatChartDisplayValue(point.value, displayUnit, definition.metric_type, rounding);
    return {
      as_of_date: point.as_of_date,
      as_of_label: point.as_of_label,
      tick_label: formatTickLabel(point.as_of_label, definition.frequency),
      value: point.value,
      display_value_text: displayValue,
      tooltip_title: point.as_of_label,
      tooltip_value_text: displayValue
    };
  });
}

function buildSuggestedTicks(points: ChartPoint[]): string[] {
  if (points.length <= 4) {
    return points.map((point) => point.tick_label);
  }

  const result = [points[0]?.tick_label, points[Math.floor(points.length / 2)]?.tick_label, points.at(-1)?.tick_label].filter(
    (value): value is string => Boolean(value)
  );
  return [...new Set(result)];
}

function selectSeriesForDefinition(series: RawObservation[], metricId: string, referenceDate: string): RawObservation[] {
  if (!metricId.startsWith("statutory_minimum_wage")) {
    return series;
  }

  if (metricId === "statutory_minimum_wage_current") {
    return series.filter((point) => point.as_of_date <= referenceDate);
  }

  const current = series.filter((point) => point.as_of_date <= referenceDate).at(-1);
  const next = series.find((point) => point.as_of_date > referenceDate);
  return [current, next].filter((point): point is RawObservation => Boolean(point));
}

function defaultTimeLabel(frequency: RawObservation["frequency"]): string {
  switch (frequency) {
    case "daily":
      return "日期";
    case "monthly":
      return "月份";
    case "quarterly":
      return "季度";
    case "half_yearly":
      return "半年期間";
    case "annual":
      return "年份";
    case "event":
      return "生效日期";
    default:
      return "期間";
  }
}

function sortObservations(series: RawObservation[]): RawObservation[] {
  return [...series].sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

function previousYearSamePeriod(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${year - 1}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatChartDisplayValue(
  value: number,
  displayUnit: string,
  metricType: TransformedMetric["metric_type"],
  roundingPolicy: TransformedMetric["rounding_policy"]
): string {
  const scaled = applyDisplayScale(value, roundingPolicy);

  if (metricType === "yoy_percent" || metricType === "qoq_percent") {
    return `${value >= 0 ? "+" : ""}${scaled.toFixed(roundingPolicy.value_decimals)}%`;
  }

  if (displayUnit === "%") {
    return `${scaled.toFixed(roundingPolicy.value_decimals)}%`;
  }

  if (displayUnit === "HK$/小時") {
    return `HK$${scaled.toFixed(roundingPolicy.value_decimals)}/小時`;
  }

  if (displayUnit === "億港元") {
    return `${scaled.toFixed(roundingPolicy.value_decimals)}億`;
  }

  if (displayUnit === "萬億港元") {
    return `${scaled.toFixed(roundingPolicy.value_decimals)}萬億`;
  }

  if (displayUnit === "歲" || displayUnit === "指數") {
    return `${scaled.toFixed(roundingPolicy.value_decimals)} ${displayUnit}`.trim();
  }

  return `${new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: roundingPolicy.value_decimals,
    minimumFractionDigits: roundingPolicy.value_decimals
  }).format(scaled)} ${displayUnit}`.trim();
}

function applyDisplayScale(value: number, roundingPolicy: TransformedMetric["rounding_policy"]): number {
  return roundingPolicy.display_scale ? value * roundingPolicy.display_scale : value;
}

function buildBalanceNarrative(
  latestValue: number,
  previousValue: number,
  metric: Pick<TransformedMetric, "display_unit" | "rounding_policy" | "comparison_basis_label_tc" | "comparison_period_label">
): {
  balance_position: BalancePosition;
  previous_balance_position: BalancePosition;
  balance_change_narrative: BalanceChangeNarrative;
  display_change_narrative_text: string;
} {
  const currentPosition = positionForBalance(latestValue);
  const previousPosition = positionForBalance(previousValue);
  const amount = formatBalanceMagnitude(Math.abs(latestValue - previousValue), metric);
  const prefix = `${metric.comparison_basis_label_tc}${metric.comparison_period_label ? `（${metric.comparison_period_label}）` : ""}`;

  if (currentPosition === "deficit" && previousPosition === "deficit") {
    const narrowed = Math.abs(latestValue) < Math.abs(previousValue);
    return {
      balance_position: currentPosition,
      previous_balance_position: previousPosition,
      balance_change_narrative: narrowed ? "deficit_narrowed" : "deficit_widened",
      display_change_narrative_text: `${prefix} 逆差${narrowed ? "收窄" : "擴大"} ${amount}`
    };
  }

  if (currentPosition === "surplus" && previousPosition === "surplus") {
    const increased = Math.abs(latestValue) > Math.abs(previousValue);
    return {
      balance_position: currentPosition,
      previous_balance_position: previousPosition,
      balance_change_narrative: increased ? "surplus_increased" : "surplus_decreased",
      display_change_narrative_text: `${prefix} 順差${increased ? "增加" : "減少"} ${amount}`
    };
  }

  if (currentPosition === "surplus" && previousPosition === "deficit") {
    return {
      balance_position: currentPosition,
      previous_balance_position: previousPosition,
      balance_change_narrative: "deficit_to_surplus",
      display_change_narrative_text: `${prefix} 由逆差轉為順差 ${amount}`
    };
  }

  if (currentPosition === "deficit" && previousPosition === "surplus") {
    return {
      balance_position: currentPosition,
      previous_balance_position: previousPosition,
      balance_change_narrative: "surplus_to_deficit",
      display_change_narrative_text: `${prefix} 由順差轉為逆差 ${amount}`
    };
  }

  return {
    balance_position: currentPosition,
    previous_balance_position: previousPosition,
    balance_change_narrative: "unchanged",
    display_change_narrative_text: `${prefix} 變化 ${amount}`
  };
}

function positionForBalance(value: number): BalancePosition {
  if (value > 0) {
    return "surplus";
  }
  if (value < 0) {
    return "deficit";
  }
  return "balanced";
}

function formatBalanceMagnitude(
  value: number,
  metric: Pick<TransformedMetric, "display_unit" | "rounding_policy">
): string {
  const scaled = metric.rounding_policy.display_scale ? value * metric.rounding_policy.display_scale : value;
  if (metric.display_unit === "億港元") {
    return `${scaled.toFixed(metric.rounding_policy.change_decimals)}億`;
  }
  return new Intl.NumberFormat("zh-Hant-HK", {
    maximumFractionDigits: metric.rounding_policy.change_decimals,
    minimumFractionDigits: metric.rounding_policy.change_decimals
  }).format(scaled);
}
