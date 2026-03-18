import { URLs } from "./source";
import type {
  ComparisonBasis,
  Frequency,
  MeasureSelector,
  MetricDefinition,
  MetricType,
  SourceRef
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
  period_mode?: "default" | "rolling_m3m";
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
  loader_kind: "dh_births";
  url: string;
};

export type LabourMetricDefinition = BaseMetricDefinition & {
  loader_kind: "minimum_wage";
};

export type HkmaMetricDefinition = BaseMetricDefinition & {
  loader_kind: "hkma";
  metric_key: "base_rate" | "hibor_1m";
};

export type RvdCompletionsMetricDefinition = BaseMetricDefinition & {
  loader_kind: "rvd_completions";
  url: string;
};

export type MetricDefinitionRecord =
  | CenstatdMetricDefinition
  | CsvMetricDefinition
  | BirthsMetricDefinition
  | LabourMetricDefinition
  | HkmaMetricDefinition
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
  dataset_url,
  api_url: URLs.censtatd(table_id),
  table_id
});

const dh: SourceRef = {
  publisher: "衞生署",
  dataset_url: URLs.birthsCsv
};

const labourDepartment: SourceRef = {
  publisher: "勞工處",
  dataset_url: URLs.smwPage
};

const rvdPriceSource: SourceRef = {
  publisher: "差餉物業估價署",
  dataset_url: URLs.rvdPriceCsv
};

const rvdRentSource: SourceRef = {
  publisher: "差餉物業估價署",
  dataset_url: URLs.rvdRentCsv
};

const rvdCompletionSource: SourceRef = {
  publisher: "差餉物業估價署",
  dataset_url: URLs.rvdCompletionsCsv
};

const fstbSource: SourceRef = {
  publisher: "財經事務及庫務局",
  dataset_url: URLs.fstbOverviewCsv
};

const hkmaSource: SourceRef = {
  publisher: "香港金融管理局",
  dataset_url: "https://www.hkma.gov.hk/eng/data-publications-and-research/data-and-statistics/daily-monetary-statistics/",
  api_url: URLs.hkmaInterbankLiquidity
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
  frequency: Frequency;
  unit: string;
  metric_type: MetricType;
  change_type: MetricDefinition["change_type"];
  comparison_basis: ComparisonBasis;
  expected_update?: string;
  source_note?: string;
  validation?: MetricDefinition["validation"];
  sparkline_metric_type?: MetricType;
  sparkline_series_role?: "primary" | "auxiliary";
  series_label_tc: string;
}): BaseMetricDefinition {
  return {
    ...args,
    comparison_basis_label_tc: basisLabel(args.comparison_basis)
  };
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
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 0, max: 15 },
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
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 0, max: 10 },
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_rolling_window",
        expected_update: "每月",
        validation: { min: 2500000, max: 4500000, disallow_three_digit: true },
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
        id: "cpi_yoy",
        card_id: "inflation",
        label_tc: "綜合 CPI 按年變動",
        source: cAndSD(URLs.cpiDataset, "510-60001A"),
        frequency: "monthly",
        unit: "%",
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每月",
        validation: { min: -10, max: 15 },
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
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每季",
        validation: { min: -25, max: 25 },
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
        metric_type: "yoy_percent",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每季",
        validation: { min: -25, max: 30 },
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
        id: "retail_sales",
        card_id: "consumption-travel",
        label_tc: "零售銷售額",
        source: cAndSD(URLs.retailDataset, "620-67001"),
        frequency: "monthly",
        unit: "百萬港元",
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 10000, max: 100000, compare_auxiliary_delta_max: 0.2 },
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
        metric_type: "level",
        change_type: "yoy_percent",
        comparison_basis: "same_period_last_year",
        expected_update: "每月",
        validation: { min: 0, max: 10000000 },
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
        id: "statutory_minimum_wage",
        card_id: "minimum-wage",
        label_tc: "法定最低工資",
        source: labourDepartment,
        frequency: "event",
        unit: "港元/小時",
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "event_previous_effective",
        expected_update: "按政策變動",
        validation: { min: 20, max: 100 },
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "same_period_last_year",
        expected_update: "半年",
        validation: { min: 6000000, max: 9000000 },
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
        label_tc: "出生數",
        source: dh,
        frequency: "annual",
        unit: "人",
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        validation: { min: 10000, max: 100000, disallow_year_value: true },
        series_label_tc: "活產嬰兒總數"
      }),
      loader_kind: "dh_births",
      url: URLs.birthsCsv
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
        validation: { min: 20, max: 80 },
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每月",
        series_label_tc: "私人住宅售價指數"
      }),
      loader_kind: "csv_long",
      url: URLs.rvdPriceCsv,
      date_columns: ["Month"],
      value_columns: ["All Classes"]
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每月",
        series_label_tc: "私人住宅租金指數"
      }),
      loader_kind: "csv_long",
      url: URLs.rvdRentCsv,
      date_columns: ["Month"],
      value_columns: ["All Classes"]
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
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
        metric_type: "level",
        change_type: "absolute_change",
        comparison_basis: "previous_observation",
        expected_update: "每年",
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
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每日",
        validation: { min: 0, max: 20 },
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
        metric_type: "level",
        change_type: "percentage_point_change",
        comparison_basis: "previous_observation",
        expected_update: "每日",
        validation: { min: 0, max: 20 },
        series_label_tc: "1個月 HIBOR"
      }),
      loader_kind: "hkma",
      metric_key: "hibor_1m"
    }
  }
];
