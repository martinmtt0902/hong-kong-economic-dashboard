import { URLs } from "./source";
import type {
  ComparisonBasis,
  Frequency,
  MeasureSelector,
  MetricDefinition,
  MetricType,
  RoundingPolicy,
  SourceRef,
  SourceSystem
} from "./types";

type BaseMetricDefinition = MetricDefinition & {
  series_label_tc: string;
};

export type CenstatdMetricDefinition = BaseMetricDefinition & {
  loader_kind: "censtatd";
  table_id: string;
  dimensions: Record<string, string>;
  measure: MeasureSelector;
  scale?: number;
  period_mode?: "default" | "rolling_m3m" | "quarter_end_month";
};

export type CsvMetricDefinition = BaseMetricDefinition & {
  loader_kind: "csv_long";
  url: string;
  date_columns: string[];
  value_columns: string[];
  row_filter?: (row: Record<string, string>) => boolean;
  label_selector?: (row: Record<string, string>) => string | undefined;
};

export type BirthsMetricDefinition = BaseMetricDefinition & {
  loader_kind: "births_registration";
  url: string;
};

export type LabourMetricDefinition = BaseMetricDefinition & {
  loader_kind: "minimum_wage";
};

export type HkmaMetricDefinition = BaseMetricDefinition & {
  loader_kind: "hkma";
  metric_key: "base_rate" | "hibor_1m" | "m3_total";
};

export type RvdCompletionsMetricDefinition = BaseMetricDefinition & {
  loader_kind: "rvd_completions";
  url: string;
};

export type RvdIndexMetricDefinition = BaseMetricDefinition & {
  loader_kind: "rvd_index";
  url: string;
  series_key: "price" | "rent";
};

export type MetricDefinitionRecord =
  | CenstatdMetricDefinition
  | CsvMetricDefinition
  | BirthsMetricDefinition
  | LabourMetricDefinition
  | HkmaMetricDefinition
  | RvdIndexMetricDefinition
  | RvdCompletionsMetricDefinition;

type AuxiliarySeriesDefinition = {
  id: string;
  source: SourceRef;
  loader_kind: "censtatd";
  table_id: string;
  dimensions: Record<string, string>;
  measure: MeasureSelector;
  frequency: Frequency;
  unit: string;
};

export type MetricPipelineDefinition = {
  metric: MetricDefinitionRecord;
  auxiliary_series?: AuxiliarySeriesDefinition[];
};

const cAndSD = (dataset_url: string, table_id: string): SourceRef => ({
  publisher: "政府統計處",
  source_system: "censtatd_api",
  dataset_id: datasetUrlToDatasetId(dataset_url),
  dataset_url,
  api_url: URLs.censtatd(table_id),
  table_id
});

function cAndSDTable(
  dataset_url: string,
  table_id: string,
  dataset_title: string,
  statistical_framework: string
): SourceRef {
  return {
    ...cAndSD(dataset_url, table_id),
    dataset_title,
    statistical_framework
  };
}

const birthsRegistrationSource: SourceRef = {
  publisher: "入境事務處",
  source_system: "immd_csv",
  dataset_id: datasetUrlToDatasetId(URLs.birthsRegistrationDataset),
  dataset_url: URLs.birthsRegistrationDataset,
  api_url: URLs.birthsRegistrationCsv,
  dataset_title: "出生登記統計數字",
  statistical_framework: "Births Registration Statistics"
};

const labourDepartment: SourceRef = {
  publisher: "勞工處",
  source_system: "labour_html",
  dataset_url: URLs.smwPage,
  dataset_title: "法定最低工資",
  statistical_framework: "Statutory Minimum Wage"
};

const rvdPriceSource: SourceRef = {
  publisher: "差餉物業估價署",
  source_system: "rvd_csv",
  dataset_url: URLs.rvdPriceCsv,
  dataset_title: "私人住宅售價指數",
  statistical_framework: "Property Market Statistics"
};

const rvdRentSource: SourceRef = {
  publisher: "差餉物業估價署",
  source_system: "rvd_csv",
  dataset_url: URLs.rvdRentCsv,
  dataset_title: "私人住宅租金指數",
  statistical_framework: "Property Market Statistics"
};

const rvdCompletionSource: SourceRef = {
  publisher: "差餉物業估價署",
  source_system: "rvd_csv",
  dataset_url: URLs.rvdCompletionsCsv,
  dataset_title: "私人住宅落成量",
  statistical_framework: "Property Market Statistics"
};

const fstbSource: SourceRef = {
  publisher: "財經事務及庫務局",
  source_system: "fstb_csv",
  dataset_url: URLs.fstbOverviewCsv,
  dataset_title: "香港主要財政統計數字總覽",
  statistical_framework: "Public Finance Statistics"
};

const hkmaSource: SourceRef = {
  publisher: "香港金融管理局",
  source_system: "hkma_api",
  dataset_url: "https://www.hkma.gov.hk/eng/data-publications-and-research/data-and-statistics/daily-monetary-statistics/",
  api_url: URLs.hkmaInterbankLiquidity,
  dataset_title: "Daily Monetary Statistics",
  statistical_framework: "Monetary and Banking Statistics"
};

const hkmaMonetaryStatisticsSource: SourceRef = {
  publisher: "香港金融管理局",
  source_system: "hkma_api",
  dataset_id: "hk-hkma-t01-t0101monetary-statistics",
  dataset_url: "https://data.gov.hk/en-data/dataset/hk-hkma-t01-t0101monetary-statistics",
  api_url: URLs.hkmaMonetaryStatistics,
  dataset_title: "Market Data and Statistics - Monthly Statistical Bulletin - Financial statistics summary - Monetary statistics",
  statistical_framework: "Monetary Statistics"
};

const defaultLevelRounding: RoundingPolicy = {
  value_decimals: 0,
  change_decimals: 0,
  previous_decimals: 0
};

const oneDecimalRounding: RoundingPolicy = {
  value_decimals: 1,
  change_decimals: 1,
  previous_decimals: 1
};

const fiscalRounding: RoundingPolicy = {
  value_decimals: 1,
  change_decimals: 1,
  previous_decimals: 1,
  display_scale: 0.01,
  display_scale_label: "億港元"
};

const tradeRounding: RoundingPolicy = {
  value_decimals: 1,
  change_decimals: 1,
  previous_decimals: 1,
  display_scale: 0.01,
  display_scale_label: "億港元"
};

const m3Rounding: RoundingPolicy = {
  value_decimals: 1,
  change_decimals: 1,
  previous_decimals: 1,
  display_scale: 0.000001,
  display_scale_label: "萬億港元"
};

function basisLabel(basis: ComparisonBasis): string {
  switch (basis) {
    case "previous_observation":
      return "較上期";
    case "same_period_last_year":
      return "較去年同月";
    case "previous_rolling_window":
      return "較上一個三個月移動窗";
    case "event_previous_effective":
      return "較上一次生效值";
    default:
      return "較上期";
  }
}

function metricBase(args: {
  id: string;
  card_id: string;
  label_tc: string;
  source: SourceRef;
  render_strategy?: MetricDefinition["render_strategy"];
  frequency: Frequency;
  unit: string;
  display_unit?: string;
  rounding_policy?: RoundingPolicy;
  metric_type: MetricType;
  change_type: MetricDefinition["change_type"];
  comparison_basis: ComparisonBasis;
  expected_update?: string;
  source_note?: string;
  validation?: MetricDefinition["validation"];
  sparkline_metric_type?: MetricType;
  sparkline_series_role?: "primary" | "auxiliary";
  chart_type?: "line" | "step_after";
  chart_time_label?: string;
  chart_value_label?: string;
  chart_tick_mode?: "compact" | "full";
  series_label_tc: string;
}): BaseMetricDefinition {
  return {
    ...args,
    comparison_basis_label_tc: basisLabel(args.comparison_basis)
  };
}

function datasetUrlToDatasetId(datasetUrl: string): string | undefined {
  const match = datasetUrl.match(/\/dataset\/([^/]+)/);
  return match?.[1];
}

export const metricDefinitions: MetricPipelineDefinition[] = [
  {
    metric: {
      ...metricBase({
        id: "unemployment",
        card_id: "employment",
        label_tc: "失業率",
        source: cAndSD(URLs.unemploymentDataset, "210-06101"),
        frequency: "monthly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 0, max: 15 },
        chart_time_label: "三個月移動期間",
        chart_value_label: "失業率",
        chart_tick_mode: "full",
        series_label_tc: "經季節性調整失業率"
      }),
      loader_kind: "censtatd",
      table_id: "210-06101",
      dimensions: { SEX: "", freq: "M3M" },
      measure: { measure_code: "SAUR", measure_aliases: ["SAUR"], allowed_labels_tc: ["(%)"] },
      period_mode: "rolling_m3m"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "underemployment",
        card_id: "employment",
        label_tc: "就業不足率",
        source: cAndSD(URLs.unemploymentDataset, "210-06101"),
        frequency: "monthly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 0, max: 10 },
        chart_time_label: "三個月移動期間",
        chart_value_label: "就業不足率",
        chart_tick_mode: "full",
        series_label_tc: "就業不足率"
      }),
      loader_kind: "censtatd",
      table_id: "210-06101",
      dimensions: { SEX: "", freq: "M3M" },
      measure: { measure_code: "UDR", measure_aliases: ["UDR"], allowed_labels_tc: ["(%)"] },
      period_mode: "rolling_m3m"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "labour_force",
        card_id: "employment",
        label_tc: "勞動人口",
        source: cAndSD(URLs.unemploymentDataset, "210-06101"),
        frequency: "monthly",
        unit: "人",
        display_unit: "人",
        rounding_policy: defaultLevelRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 2500000, max: 4500000, disallow_three_digit: true },
        chart_time_label: "三個月移動期間",
        chart_value_label: "勞動人口",
        chart_tick_mode: "full",
        series_label_tc: "勞動人口"
      }),
      loader_kind: "censtatd",
      table_id: "210-06101",
      dimensions: { SEX: "", freq: "M3M" },
      measure: { measure_code: "LF", measure_aliases: ["LF"], allowed_labels_tc: ["千人"] },
      scale: 1000,
      period_mode: "rolling_m3m"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "labour_force_participation_rate",
        card_id: "employment",
        label_tc: "勞動人口參與率",
        source: cAndSDTable(
          URLs.lfprDataset,
          "210-06201",
          "按年齡及性別劃分的勞動人口及勞動人口參與率",
          "General Household Survey / Labour Force Statistics"
        ),
        frequency: "monthly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 30, max: 80 },
        chart_time_label: "三個月移動期間",
        chart_value_label: "勞動人口參與率",
        chart_tick_mode: "full",
        series_label_tc: "勞動人口參與率"
      }),
      loader_kind: "censtatd",
      table_id: "210-06201",
      dimensions: { AGE: "", SEX: "", freq: "M3M" },
      measure: { measure_code: "LFPR", measure_aliases: ["LFPR"], allowed_labels_tc: ["(%)"] },
      period_mode: "rolling_m3m"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "vacancies",
        card_id: "employment",
        label_tc: "職位空缺數",
        source: cAndSDTable(
          URLs.vacanciesDataset,
          "215-16007",
          "按行業主類及主要職業組別劃分的職位空缺數目（公務員除外）",
          "Employment and Vacancies Statistics / establishment-based"
        ),
        frequency: "quarterly",
        unit: "個",
        display_unit: "個",
        rounding_policy: defaultLevelRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "same_period_last_year",
        expected_update: "每季",
        source_note: "機構單位統計（establishment-based），非住戶統計",
        validation: { min: 0, max: 500000 },
        chart_time_label: "季度",
        chart_value_label: "職位空缺數",
        series_label_tc: "職位空缺數"
      }),
      comparison_basis_label_tc: "較去年同期",
      loader_kind: "censtatd",
      table_id: "215-16007",
      dimensions: { IND: "", OCC: "", freq: "M" },
      measure: { measure_code: "VAC", measure_aliases: ["VAC"], allowed_labels_tc: ["數目"] },
      period_mode: "quarter_end_month"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "real_payroll_per_person_engaged_index",
        card_id: "wages-income",
        label_tc: "從業人士實質平均薪金指數",
        source: cAndSDTable(
          URLs.realPayrollIndexDataset,
          "220-19024",
          "按行業大類劃分的從業人士實質平均薪金指數",
          "Labour Earnings Survey / payroll per person engaged"
        ),
        frequency: "quarterly",
        unit: "指數",
        display_unit: "指數",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每季",
        validation: { min: 50, max: 200, compare_auxiliary_delta_max: 0.2 },
        chart_time_label: "季度",
        chart_value_label: "從業人士實質平均薪金指數",
        series_label_tc: "從業人士實質平均薪金指數"
      }),
      comparison_basis_label_tc: "較去年同期",
      loader_kind: "censtatd",
      table_id: "220-19024",
      dimensions: { IND: "", freq: "Q" },
      measure: { measure_code: "RIPCP", measure_aliases: ["RIPCP"], allowed_labels_tc: ["指數"] }
    },
    auxiliary_series: [
      {
        id: "real_payroll_per_person_engaged_index_yoy_helper",
        source: cAndSDTable(
          URLs.realPayrollIndexDataset,
          "220-19024",
          "按行業大類劃分的從業人士實質平均薪金指數",
          "Labour Earnings Survey / payroll per person engaged"
        ),
        loader_kind: "censtatd",
        table_id: "220-19024",
        dimensions: { IND: "", freq: "Q" },
        measure: {
          measure_code: "RIPCP",
          measure_aliases: ["RIPCP"],
          allowed_labels_tc: ["按年變動百分率"]
        },
        frequency: "quarterly",
        unit: "%"
      }
    ]
  },
  {
    metric: {
      ...metricBase({
        id: "median_monthly_wage",
        card_id: "wages-income",
        label_tc: "月薪中位數",
        source: cAndSDTable(
          URLs.aehsMedianMonthlyWageDataset,
          "220-23011",
          "按受聘性質及性別劃分的每月工資水平及分布",
          "Annual Earnings and Hours Survey (AEHS)"
        ),
        frequency: "annual",
        unit: "元",
        display_unit: "元",
        rounding_policy: defaultLevelRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        source_note: "AEHS 全體僱員總計的每月工資中位數",
        validation: { min: 5000, max: 100000 },
        chart_time_label: "年份",
        chart_value_label: "月薪中位數",
        series_label_tc: "月薪中位數"
      }),
      loader_kind: "censtatd",
      table_id: "220-23011",
      dimensions: { SEX: "", EMP_NATURE: "", freq: "Y" },
      measure: { measure_code: "MW", measure_aliases: ["MW"], allowed_labels_tc: ["第五十個百分位數（港元）"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "median_hourly_wage",
        card_id: "wages-income",
        label_tc: "時薪中位數",
        source: cAndSDTable(
          URLs.aehsMedianHourlyWageDataset,
          "220-23024",
          "按職業組別及性別劃分的每小時工資水平及分布",
          "Annual Earnings and Hours Survey (AEHS)"
        ),
        frequency: "annual",
        unit: "元/小時",
        display_unit: "元/小時",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        source_note: "AEHS 全體僱員總計的每小時工資中位數",
        validation: { min: 10, max: 500 },
        chart_time_label: "年份",
        chart_value_label: "時薪中位數",
        series_label_tc: "時薪中位數"
      }),
      loader_kind: "censtatd",
      table_id: "220-23024",
      dimensions: { OCC: "", SEX: "", freq: "Y" },
      measure: { measure_code: "HW", measure_aliases: ["HW"], allowed_labels_tc: ["第五十個百分位數（港元）"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "cpi_yoy",
        card_id: "inflation",
        label_tc: "綜合 CPI 按年變動",
        source: cAndSD(URLs.cpiDataset, "510-60001A"),
        frequency: "monthly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每月",
        validation: { min: -10, max: 15 },
        chart_time_label: "月份",
        chart_value_label: "綜合 CPI 按年變動",
        series_label_tc: "綜合消費物價指數按年變動"
      }),
      loader_kind: "censtatd",
      table_id: "510-60001A",
      dimensions: { GROUP: "", freq: "M" },
      measure: {
        measure_code: "CC_CM_1920",
        measure_aliases: ["CC_CM_1920"],
        allowed_labels_tc: ["按年變動百分率"]
      }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "gdp_real_yoy",
        card_id: "gdp",
        label_tc: "實質增長",
        source: cAndSD(URLs.gdpRealDataset, "310-31003"),
        frequency: "quarterly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每季",
        validation: { min: -25, max: 25 },
        chart_time_label: "季度",
        chart_value_label: "實質 GDP 增長",
        series_label_tc: "實質本地生產總值按年變動"
      }),
      loader_kind: "censtatd",
      table_id: "310-31003",
      dimensions: { GDP_COMPONENT: "", freq: "Q" },
      measure: { measure_code: "CON", measure_aliases: ["CON"], allowed_labels_tc: ["按年變動百分率"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "gdp_nominal_yoy",
        card_id: "gdp",
        label_tc: "名義增長",
        source: cAndSD(URLs.gdpCurrentDataset, "310-31002"),
        frequency: "quarterly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每季",
        validation: { min: -25, max: 30 },
        chart_time_label: "季度",
        chart_value_label: "名義 GDP 增長",
        series_label_tc: "名義本地生產總值按年變動"
      }),
      loader_kind: "censtatd",
      table_id: "310-31002",
      dimensions: { GDP_COMPONENT: "", freq: "Q" },
      measure: { measure_code: "CUR", measure_aliases: ["CUR"], allowed_labels_tc: ["按年變動百分率"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "current_account_balance",
        card_id: "gdp",
        label_tc: "經常賬戶差額",
        source: cAndSDTable(
          URLs.currentAccountDataset,
          "315-37001",
          "國際收支平衡表",
          "Balance of Payments"
        ),
        render_strategy: "balance_sign_aware",
        frequency: "quarterly",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: tradeRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每季",
        chart_time_label: "季度",
        chart_value_label: "經常賬戶差額",
        series_label_tc: "經常賬戶差額"
      }),
      loader_kind: "censtatd",
      table_id: "315-37001",
      dimensions: { BOP_COMPONENT: "CRA", freq: "Q" },
      measure: { measure_code: "BOP", measure_aliases: ["BOP"], allowed_labels_tc: ["百萬港元"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "private_consumption_expenditure",
        card_id: "gdp",
        label_tc: "私人消費開支（PCE）",
        source: cAndSDTable(
          URLs.pceRealDataset,
          "310-31012",
          "按組成部分劃分的私人消費開支－以環比物量計算",
          "National Accounts / GDP expenditure approach"
        ),
        frequency: "quarterly",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每季",
        validation: { min: -30, max: 30 },
        chart_time_label: "季度",
        chart_value_label: "私人消費開支（PCE）",
        sparkline_series_role: "primary",
        sparkline_metric_type: "yoy_percent",
        series_label_tc: "私人消費開支按年變動"
      }),
      loader_kind: "censtatd",
      table_id: "310-31012",
      dimensions: { GDP_COMPONENT: "PCE", freq: "Q" },
      measure: { measure_code: "CON", measure_aliases: ["CON"], allowed_labels_tc: ["按年變動百分率"] }
    },
    auxiliary_series: [
      {
        id: "private_consumption_expenditure_nominal_level",
        source: cAndSDTable(
          URLs.pceCurrentDataset,
          "310-31011",
          "按組成部分劃分的私人消費開支－以當時市價計算",
          "National Accounts / GDP expenditure approach"
        ),
        loader_kind: "censtatd",
        table_id: "310-31011",
        dimensions: { GDP_COMPONENT: "PCE", freq: "Q" },
        measure: {
          measure_code: "CUR",
          measure_aliases: ["CUR"],
          allowed_labels_tc: ["百萬港元"]
        },
        frequency: "quarterly",
        unit: "百萬港元"
      }
    ]
  },
  {
    metric: {
      ...metricBase({
        id: "total_exports_value",
        card_id: "external-trade",
        label_tc: "整體出口貨值",
        source: cAndSDTable(
          URLs.tradeDataset,
          "410-50001",
          "對外商品貿易總計數字",
          "Merchandise Trade"
        ),
        frequency: "monthly",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: tradeRounding,
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 1000, max: 2000000, compare_auxiliary_delta_max: 0.2 },
        chart_time_label: "月份",
        chart_value_label: "整體出口貨值",
        series_label_tc: "整體出口貨值"
      }),
      loader_kind: "censtatd",
      table_id: "410-50001",
      dimensions: { freq: "M" },
      measure: { measure_code: "VAL_TX", measure_aliases: ["VAL_TX"], allowed_labels_tc: ["百萬港元"] }
    },
    auxiliary_series: [
      {
        id: "total_exports_value_yoy_helper",
        source: cAndSDTable(
          URLs.tradeDataset,
          "410-50001",
          "對外商品貿易總計數字",
          "Merchandise Trade"
        ),
        loader_kind: "censtatd",
        table_id: "410-50001",
        dimensions: { freq: "M" },
        measure: {
          measure_code: "VAL_TX",
          measure_aliases: ["VAL_TX"],
          allowed_labels_tc: ["按年變動百分率"]
        },
        frequency: "monthly",
        unit: "%"
      }
    ]
  },
  {
    metric: {
      ...metricBase({
        id: "imports_value",
        card_id: "external-trade",
        label_tc: "進口貨值",
        source: cAndSDTable(
          URLs.tradeDataset,
          "410-50001",
          "對外商品貿易總計數字",
          "Merchandise Trade"
        ),
        frequency: "monthly",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: tradeRounding,
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 1000, max: 2000000, compare_auxiliary_delta_max: 0.2 },
        chart_time_label: "月份",
        chart_value_label: "進口貨值",
        series_label_tc: "進口貨值"
      }),
      loader_kind: "censtatd",
      table_id: "410-50001",
      dimensions: { freq: "M" },
      measure: { measure_code: "VAL_IM", measure_aliases: ["VAL_IM"], allowed_labels_tc: ["百萬港元"] }
    },
    auxiliary_series: [
      {
        id: "imports_value_yoy_helper",
        source: cAndSDTable(
          URLs.tradeDataset,
          "410-50001",
          "對外商品貿易總計數字",
          "Merchandise Trade"
        ),
        loader_kind: "censtatd",
        table_id: "410-50001",
        dimensions: { freq: "M" },
        measure: {
          measure_code: "VAL_IM",
          measure_aliases: ["VAL_IM"],
          allowed_labels_tc: ["按年變動百分率"]
        },
        frequency: "monthly",
        unit: "%"
      }
    ]
  },
  {
    metric: {
      ...metricBase({
        id: "visible_trade_balance",
        card_id: "external-trade",
        label_tc: "有形貿易差額",
        source: cAndSDTable(
          URLs.tradeDataset,
          "410-50001",
          "對外商品貿易總計數字",
          "Merchandise Trade"
        ),
        render_strategy: "balance_sign_aware",
        frequency: "monthly",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: tradeRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        chart_time_label: "月份",
        chart_value_label: "有形貿易差額",
        series_label_tc: "有形貿易差額"
      }),
      loader_kind: "censtatd",
      table_id: "410-50001",
      dimensions: { freq: "M" },
      measure: { measure_code: "BAL", measure_aliases: ["BAL"], allowed_labels_tc: ["百萬港元"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "retail_sales",
        card_id: "consumption-travel",
        label_tc: "零售銷售額",
        source: cAndSD(URLs.retailDataset, "620-67001"),
        frequency: "monthly",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: {
          value_decimals: 1,
          change_decimals: 1,
          previous_decimals: 1,
          display_scale: 0.01,
          display_scale_label: "億港元"
        },
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 10000, max: 100000, compare_auxiliary_delta_max: 0.2 },
        chart_time_label: "月份",
        chart_value_label: "零售銷售額",
        series_label_tc: "零售業總銷貨價值"
      }),
      loader_kind: "censtatd",
      table_id: "620-67001",
      dimensions: { freq: "M" },
      measure: { measure_code: "VAL_RS", measure_aliases: ["VAL_RS"], allowed_labels_tc: ["百萬港元"] },
      sparkline_series_role: "primary"
    },
    auxiliary_series: [
      {
        id: "retail_sales_yoy_helper",
        source: cAndSD(URLs.retailDataset, "620-67001"),
        loader_kind: "censtatd",
        table_id: "620-67001",
        dimensions: { freq: "M" },
        measure: {
          measure_code: "VAL_IDX_RS",
          measure_aliases: ["VAL_IDX_RS"],
          allowed_labels_tc: ["按年變動百分率"]
        },
        frequency: "monthly",
        unit: "%"
      }
    ]
  },
  {
    metric: {
      ...metricBase({
        id: "visitor_arrivals",
        card_id: "consumption-travel",
        label_tc: "旅客入境",
        source: cAndSD(URLs.visitorDataset, "650-80001"),
        frequency: "monthly",
        unit: "人次",
        display_unit: "人次",
        rounding_policy: {
          value_decimals: 0,
          change_decimals: 1,
          previous_decimals: 0
        },
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 0, max: 10000000 },
        chart_time_label: "月份",
        chart_value_label: "旅客入境",
        series_label_tc: "訪港旅客"
      }),
      loader_kind: "censtatd",
      table_id: "650-80001",
      dimensions: { REGION: "" },
      measure: { measure_code: "VIS_ARR", measure_aliases: ["VIS_ARR"], allowed_labels_tc: ["數目"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "statutory_minimum_wage_current",
        card_id: "minimum-wage",
        label_tc: "現行法定最低工資",
        source: labourDepartment,
        frequency: "event",
        unit: "港元/小時",
        display_unit: "HK$/小時",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "event_previous_effective",
        expected_update: "按政策變動",
        validation: { min: 20, max: 100 },
        chart_type: "step_after",
        chart_time_label: "生效日期",
        chart_value_label: "法定最低工資",
        chart_tick_mode: "full",
        series_label_tc: "法定最低工資"
      }),
      loader_kind: "minimum_wage"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "statutory_minimum_wage_next",
        card_id: "minimum-wage",
        label_tc: "下一個法定最低工資",
        source: labourDepartment,
        frequency: "event",
        unit: "港元/小時",
        display_unit: "HK$/小時",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "event_previous_effective",
        expected_update: "按政策變動",
        validation: { min: 20, max: 100 },
        chart_type: "step_after",
        chart_time_label: "生效日期",
        chart_value_label: "法定最低工資",
        chart_tick_mode: "full",
        series_label_tc: "法定最低工資"
      }),
      loader_kind: "minimum_wage"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "population_total",
        card_id: "population",
        label_tc: "人口總量",
        source: cAndSD(URLs.populationDataset, "110-01002"),
        frequency: "half_yearly",
        unit: "人",
        display_unit: "人",
        rounding_policy: defaultLevelRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "same_period_last_year",
        expected_update: "半年",
        validation: { min: 6000000, max: 9000000 },
        chart_time_label: "半年期間",
        chart_value_label: "人口總量",
        series_label_tc: "人口總量"
      }),
      comparison_basis_label_tc: "較去年同期",
      loader_kind: "censtatd",
      table_id: "110-01002",
      dimensions: { SEX: "", AGE: "", freq: "H" },
      measure: { measure_code: "POP", measure_aliases: ["POP"], allowed_labels_tc: ["數目 ('000)"] },
      scale: 1000
    }
  },
  {
    metric: {
      ...metricBase({
        id: "live_births",
        card_id: "population",
        label_tc: "出生登記總數",
        source: birthsRegistrationSource,
        frequency: "annual",
        unit: "人",
        display_unit: "人",
        rounding_policy: defaultLevelRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        validation: { min: 10000, max: 100000, disallow_year_value: true },
        chart_time_label: "年份",
        chart_value_label: "出生數",
        series_label_tc: "出生登記總數"
      }),
      loader_kind: "births_registration",
      url: URLs.birthsRegistrationCsv
    }
  },
  {
    metric: {
      ...metricBase({
        id: "median_age",
        card_id: "population",
        label_tc: "年齡中位數",
        source: cAndSD(URLs.medianAgeDataset, "110-01004"),
        frequency: "annual",
        unit: "歲",
        display_unit: "歲",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        validation: { min: 20, max: 80 },
        chart_time_label: "年份",
        chart_value_label: "年齡中位數",
        series_label_tc: "年齡中位數"
      }),
      loader_kind: "censtatd",
      table_id: "110-01004",
      dimensions: { SEX: "", freq: "Y" },
      measure: { measure_code: "MED_AGE_POPN", measure_aliases: ["MED_AGE_POPN"], allowed_labels_tc: ["(歲)"] }
    }
  },
  {
    metric: {
      ...metricBase({
        id: "private_price_index",
        card_id: "housing",
        label_tc: "私樓售價指數",
        source: rvdPriceSource,
        frequency: "monthly",
        unit: "指數",
        display_unit: "指數",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每月",
        chart_time_label: "月份",
        chart_value_label: "私樓售價指數",
        series_label_tc: "私人住宅售價指數"
      }),
      loader_kind: "rvd_index",
      url: URLs.rvdPriceCsv,
      series_key: "price"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "private_rent_index",
        card_id: "housing",
        label_tc: "私樓租金指數",
        source: rvdRentSource,
        frequency: "monthly",
        unit: "指數",
        display_unit: "指數",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每月",
        chart_time_label: "月份",
        chart_value_label: "私樓租金指數",
        series_label_tc: "私人住宅租金指數"
      }),
      loader_kind: "rvd_index",
      url: URLs.rvdRentCsv,
      series_key: "rent"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "private_completions",
        card_id: "housing",
        label_tc: "私人住宅落成量",
        source: rvdCompletionSource,
        frequency: "annual",
        unit: "伙",
        display_unit: "伙",
        rounding_policy: defaultLevelRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        chart_time_label: "年份",
        chart_value_label: "私人住宅落成量",
        series_label_tc: "私人住宅落成量"
      }),
      loader_kind: "rvd_completions",
      url: URLs.rvdCompletionsCsv
    }
  },
  {
    metric: {
      ...metricBase({
        id: "government_revenue",
        card_id: "fiscal",
        label_tc: "收入",
        source: fstbSource,
        frequency: "annual",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: fiscalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        chart_time_label: "財政年度",
        chart_value_label: "政府收入",
        series_label_tc: "政府收入總額"
      }),
      loader_kind: "csv_long",
      url: URLs.fstbOverviewCsv,
      date_columns: ["財政年度"],
      value_columns: ["政府收入總額"]
    }
  },
  {
    metric: {
      ...metricBase({
        id: "government_expenditure",
        card_id: "fiscal",
        label_tc: "支出",
        source: fstbSource,
        frequency: "annual",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: fiscalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        chart_time_label: "財政年度",
        chart_value_label: "政府支出",
        series_label_tc: "政府開支總額"
      }),
      loader_kind: "csv_long",
      url: URLs.fstbOverviewCsv,
      date_columns: ["財政年度"],
      value_columns: ["政府開支總額"]
    }
  },
  {
    metric: {
      ...metricBase({
        id: "fiscal_reserves",
        card_id: "fiscal",
        label_tc: "儲備",
        source: fstbSource,
        frequency: "annual",
        unit: "百萬港元",
        display_unit: "億港元",
        rounding_policy: fiscalRounding,
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        chart_time_label: "財政年度",
        chart_value_label: "財政儲備",
        series_label_tc: "年終財政儲備"
      }),
      loader_kind: "csv_long",
      url: URLs.fstbOverviewCsv,
      date_columns: ["財政年度"],
      value_columns: ["年終財政儲備"]
    }
  },
  {
    metric: {
      ...metricBase({
        id: "base_rate",
        card_id: "interest-rates",
        label_tc: "HKMA Base Rate",
        source: hkmaSource,
        frequency: "daily",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每日",
        validation: { min: 0, max: 20 },
        chart_time_label: "日期",
        chart_value_label: "HKMA Base Rate",
        series_label_tc: "基本利率"
      }),
      loader_kind: "hkma",
      metric_key: "base_rate"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "hibor_1m",
        card_id: "interest-rates",
        label_tc: "1個月 HIBOR",
        source: hkmaSource,
        frequency: "daily",
        unit: "%",
        display_unit: "%",
        rounding_policy: oneDecimalRounding,
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每日",
        validation: { min: 0, max: 20 },
        chart_time_label: "日期",
        chart_value_label: "1個月 HIBOR",
        series_label_tc: "1個月 HIBOR"
      }),
      loader_kind: "hkma",
      metric_key: "hibor_1m"
    }
  },
  {
    metric: {
      ...metricBase({
        id: "money_supply_m3",
        card_id: "interest-rates",
        label_tc: "貨幣供應 M3",
        source: hkmaMonetaryStatisticsSource,
        frequency: "monthly",
        unit: "百萬港元",
        display_unit: "萬億港元",
        rounding_policy: m3Rounding,
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 1000000, max: 50000000 },
        chart_time_label: "月份",
        chart_value_label: "貨幣供應 M3",
        series_label_tc: "貨幣供應 M3"
      }),
      comparison_basis_label_tc: "較去年同期",
      loader_kind: "hkma",
      metric_key: "m3_total"
    }
  }
];
