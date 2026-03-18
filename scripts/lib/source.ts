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
