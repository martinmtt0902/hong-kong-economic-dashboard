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
  birthsRegistrationCsv:
    "https://www.immd.gov.hk/opendata/hkt/law-and-security/personal_documentation/statistics_on_births_registration.csv",
  birthsRegistrationDataset:
    "https://data.gov.hk/en-data/dataset/hk-immd-set6-statistics-personal-documentation-births-registration",
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

export type CardDefinition = {
  id: string;
  title_tc: string;
  header_mode: "latest_by_priority" | "latest_by_date";
  header_metric_priority: string[];
};

export const cardDefinitions = [
  { id: "employment", title_tc: "就業", header_mode: "latest_by_date", header_metric_priority: [] },
  { id: "inflation", title_tc: "通脹", header_mode: "latest_by_date", header_metric_priority: [] },
  { id: "gdp", title_tc: "GDP", header_mode: "latest_by_date", header_metric_priority: [] },
  { id: "consumption-travel", title_tc: "消費與旅遊", header_mode: "latest_by_date", header_metric_priority: [] },
  {
    id: "minimum-wage",
    title_tc: "最低工資",
    header_mode: "latest_by_priority",
    header_metric_priority: ["statutory_minimum_wage_current", "statutory_minimum_wage_next"]
  },
  { id: "population", title_tc: "人口", header_mode: "latest_by_date", header_metric_priority: [] },
  {
    id: "housing",
    title_tc: "住屋",
    header_mode: "latest_by_priority",
    header_metric_priority: ["private_price_index", "private_rent_index", "private_completions"]
  },
  { id: "fiscal", title_tc: "公共財政", header_mode: "latest_by_date", header_metric_priority: [] },
  { id: "interest-rates", title_tc: "利率", header_mode: "latest_by_date", header_metric_priority: [] }
] satisfies CardDefinition[];
