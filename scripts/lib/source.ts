import type { MetricBaseConfig } from "./types";

export const URLs = {
  censtatd: (id: string) => `https://www.censtatd.gov.hk/api/get.php?full_series=1&id=${id}&lang=tc`,
  unemploymentDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-210-06101",
  cpiDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-510-60001a",
  gdpCurrentDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-310-31002",
  gdpRealDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-310-31003",
  retailDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-620-67001",
  visitorDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-650-80001",
  populationDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-110-01002",
  medianAgeDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-110-01004",
  birthsCsv:
    "https://www.dh.gov.hk/datagovhk/ncdd/Number%20of%20Known%20Births%20for%20Different%20Sexes%20and%20Crude%20Birth%20Rate%201981-2024(tc).csv",
  smwPage: "https://www.labour.gov.hk/eng/news/mwo.htm",
  smwPressRelease: "https://www.info.gov.hk/gia/general/202505/01/P2025042900231.htm",
  rvdPriceCsv: "https://www.rvd.gov.hk/datagovhk/1.4M.csv",
  rvdRentCsv: "https://www.rvd.gov.hk/datagovhk/1.3M.csv",
  rvdCompletionsCsv:
    "https://www.rvd.gov.hk/datagovhk/Dom_Completions_and_Forecast_Completions_by_District_Eng.csv",
  fstbOverviewCsv:
    "https://www.fstb.gov.hk/datagovhk/tsyb/financial-statistics/tc/fin-stats_overview_a_tc.csv",
  hkmaInterbankLiquidity:
    "https://api.hkma.gov.hk/public/market-data-and-statistics/daily-monetary-statistics/daily-figures-interbank-liquidity"
} as const;

export const cardDefinitions = [
  { id: "employment", title_tc: "就業" },
  { id: "inflation", title_tc: "通脹" },
  { id: "gdp", title_tc: "GDP" },
  { id: "consumption-travel", title_tc: "消費與旅遊" },
  { id: "minimum-wage", title_tc: "最低工資" },
  { id: "population", title_tc: "人口" },
  { id: "housing", title_tc: "住屋" },
  { id: "fiscal", title_tc: "公共財政" },
  { id: "interest-rates", title_tc: "利率" }
] as const;

export const metricConfigs: Record<string, MetricBaseConfig> = {
  unemployment: {
    id: "unemployment",
    cardId: "employment",
    label_tc: "失業率",
    unit: "%",
    frequency: "monthly",
    source_name: "政府統計處",
    source_url: URLs.unemploymentDataset,
    expected_update: "每月"
  },
  underemployment: {
    id: "underemployment",
    cardId: "employment",
    label_tc: "就業不足率",
    unit: "%",
    frequency: "monthly",
    source_name: "政府統計處",
    source_url: URLs.unemploymentDataset,
    expected_update: "每月"
  },
  labour_force: {
    id: "labour_force",
    cardId: "employment",
    label_tc: "勞動人口",
    unit: "人",
    frequency: "monthly",
    source_name: "政府統計處",
    source_url: URLs.unemploymentDataset,
    expected_update: "每月"
  },
  cpi_yoy: {
    id: "cpi_yoy",
    cardId: "inflation",
    label_tc: "綜合 CPI 按年變動",
    unit: "%",
    frequency: "monthly",
    source_name: "政府統計處",
    source_url: URLs.cpiDataset,
    expected_update: "每月"
  },
  gdp_real_yoy: {
    id: "gdp_real_yoy",
    cardId: "gdp",
    label_tc: "實質增長",
    unit: "%",
    frequency: "quarterly",
    source_name: "政府統計處",
    source_url: URLs.gdpRealDataset,
    expected_update: "每季"
  },
  gdp_nominal_yoy: {
    id: "gdp_nominal_yoy",
    cardId: "gdp",
    label_tc: "名義增長",
    unit: "%",
    frequency: "quarterly",
    source_name: "政府統計處",
    source_url: URLs.gdpCurrentDataset,
    expected_update: "每季"
  },
  retail_sales: {
    id: "retail_sales",
    cardId: "consumption-travel",
    label_tc: "零售銷售額",
    unit: "百萬港元",
    frequency: "monthly",
    source_name: "政府統計處",
    source_url: URLs.retailDataset,
    expected_update: "每月"
  },
  visitor_arrivals: {
    id: "visitor_arrivals",
    cardId: "consumption-travel",
    label_tc: "旅客入境",
    unit: "人次",
    frequency: "monthly",
    source_name: "政府統計處／旅發局",
    source_url: URLs.visitorDataset,
    expected_update: "每月"
  },
  statutory_minimum_wage: {
    id: "statutory_minimum_wage",
    cardId: "minimum-wage",
    label_tc: "法定最低工資",
    unit: "港元/小時",
    frequency: "event",
    source_name: "勞工處",
    source_url: URLs.smwPage,
    source_note: "若已公布下一次調整，於來源頁附註說明。",
    expected_update: "按政策變動"
  },
  population_total: {
    id: "population_total",
    cardId: "population",
    label_tc: "人口總量",
    unit: "人",
    frequency: "half_yearly",
    source_name: "政府統計處",
    source_url: URLs.populationDataset,
    expected_update: "半年"
  },
  live_births: {
    id: "live_births",
    cardId: "population",
    label_tc: "出生數",
    unit: "人",
    frequency: "annual",
    source_name: "衞生署",
    source_url: URLs.birthsCsv,
    expected_update: "每年"
  },
  median_age: {
    id: "median_age",
    cardId: "population",
    label_tc: "年齡中位數",
    unit: "歲",
    frequency: "annual",
    source_name: "政府統計處",
    source_url: URLs.medianAgeDataset,
    expected_update: "每年"
  },
  private_price_index: {
    id: "private_price_index",
    cardId: "housing",
    label_tc: "私樓售價指數",
    unit: "指數",
    frequency: "monthly",
    source_name: "差餉物業估價署",
    source_url: URLs.rvdPriceCsv,
    expected_update: "每月"
  },
  private_rent_index: {
    id: "private_rent_index",
    cardId: "housing",
    label_tc: "私樓租金指數",
    unit: "指數",
    frequency: "monthly",
    source_name: "差餉物業估價署",
    source_url: URLs.rvdRentCsv,
    expected_update: "每月"
  },
  private_completions: {
    id: "private_completions",
    cardId: "housing",
    label_tc: "私人住宅落成量",
    unit: "伙",
    frequency: "annual",
    source_name: "差餉物業估價署",
    source_url: URLs.rvdCompletionsCsv,
    expected_update: "每年"
  },
  government_revenue: {
    id: "government_revenue",
    cardId: "fiscal",
    label_tc: "收入",
    unit: "百萬港元",
    frequency: "annual",
    source_name: "財經事務及庫務局",
    source_url: URLs.fstbOverviewCsv,
    expected_update: "每年"
  },
  government_expenditure: {
    id: "government_expenditure",
    cardId: "fiscal",
    label_tc: "支出",
    unit: "百萬港元",
    frequency: "annual",
    source_name: "財經事務及庫務局",
    source_url: URLs.fstbOverviewCsv,
    expected_update: "每年"
  },
  fiscal_reserves: {
    id: "fiscal_reserves",
    cardId: "fiscal",
    label_tc: "儲備",
    unit: "百萬港元",
    frequency: "annual",
    source_name: "財經事務及庫務局",
    source_url: URLs.fstbOverviewCsv,
    expected_update: "每年"
  },
  base_rate: {
    id: "base_rate",
    cardId: "interest-rates",
    label_tc: "HKMA Base Rate",
    unit: "%",
    frequency: "daily",
    source_name: "香港金融管理局",
    source_url: "https://www.hkma.gov.hk/eng/data-publications-and-research/data-and-statistics/daily-monetary-statistics/",
    expected_update: "每日"
  },
  hibor_1m: {
    id: "hibor_1m",
    cardId: "interest-rates",
    label_tc: "1個月 HIBOR",
    unit: "%",
    frequency: "daily",
    source_name: "香港金融管理局",
    source_url: "https://api.hkma.gov.hk/",
    expected_update: "每日"
  }
};
