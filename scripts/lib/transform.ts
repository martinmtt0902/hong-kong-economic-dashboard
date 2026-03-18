import { frequencyRank } from "./period";
import type { MetricDefinitionRecord } from "./metric-definition";
import type {
  ComparisonBasis,
  RawObservation,
  SparklinePoint,
  TransformedMetric
} from "./types";
import { validateTransformedMetric } from "./validation";

type BuildMetricInput = {
  definition: MetricDefinitionRecord;
  primarySeries: RawObservation[];
  auxiliarySeries?: RawObservation[];
};

export function buildTransformedMetric(input: BuildMetricInput): TransformedMetric {
  const primarySeries = sortObservations(input.primarySeries);
  const auxiliarySeries = sortObservations(input.auxiliarySeries ?? []);
  const latest = primarySeries.at(-1);
  const previous = latest ? selectPreviousObservation(primarySeries, latest, input.definition.comparison_basis) : undefined;
  const changeValue =
    latest && previous ? computeChangeValue(latest.value, previous.value, input.definition.change_type) : undefined;
  const sparklineSource =
    input.definition.sparkline_series_role === "auxiliary" && auxiliarySeries.length > 0 ? auxiliarySeries : primarySeries;

  const baseMetric: TransformedMetric = {
    id: input.definition.id,
    card_id: input.definition.card_id,
    label_tc: input.definition.label_tc,
    source: input.definition.source,
    series_id: latest?.series_id ?? primarySeries[0]?.series_id ?? input.definition.id,
    auxiliary_series_ids: auxiliarySeries.length > 0 ? [...new Set(auxiliarySeries.map((item) => item.series_id))] : undefined,
    metric_type: input.definition.metric_type,
    frequency: input.definition.frequency,
    unit: input.definition.unit,
    as_of_date: latest?.as_of_date ?? "",
    as_of_label: latest?.as_of_label ?? "",
    release_date: latest?.release_date,
    latest_value: latest?.value,
    previous_value: previous?.value,
    previous_as_of_date: previous?.as_of_date,
    previous_as_of_label: previous?.as_of_label,
    change_value: changeValue,
    change_type: input.definition.change_type,
    comparison_basis: input.definition.comparison_basis,
    comparison_basis_label_tc: input.definition.comparison_basis_label_tc,
    sparkline_definition: {
      series_id: sparklineSource[0]?.series_id ?? latest?.series_id ?? input.definition.id,
      metric_type: input.definition.sparkline_metric_type ?? input.definition.metric_type,
      comparison_basis: input.definition.comparison_basis,
      unit: input.definition.unit,
      frequency: input.definition.frequency
    },
    sparkline_points: buildSparklinePoints(sparklineSource),
    validation_state: "ok",
    validation_messages: [],
    source_note: input.definition.source_note,
    expected_update: input.definition.expected_update,
    provisional: latest?.provisional
  };

  const validation = validateTransformedMetric(baseMetric, input.definition, primarySeries, auxiliarySeries);

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

export function buildSparklinePoints(series: RawObservation[], limit = 12): SparklinePoint[] {
  return series.slice(-limit).map((point) => ({
    as_of_date: point.as_of_date,
    as_of_label: point.as_of_label,
    value: point.value
  }));
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

function sortObservations(series: RawObservation[]): RawObservation[] {
  return [...series].sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

function previousYearSamePeriod(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${year - 1}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
