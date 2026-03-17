import type { MetricBaseConfig } from "./types";
export declare const URLs: {
    readonly censtatd: (id: string) => string;
    readonly unemploymentDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-210-06101";
    readonly cpiDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-510-60001a";
    readonly gdpCurrentDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-310-31002";
    readonly gdpRealDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-310-31003";
    readonly retailDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-620-67001";
    readonly visitorDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-650-80001";
    readonly populationDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-110-01002";
    readonly medianAgeDataset: "https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-110-01004";
    readonly birthsCsv: "https://www.dh.gov.hk/datagovhk/ncdd/Number%20of%20Known%20Births%20for%20Different%20Sexes%20and%20Crude%20Birth%20Rate%201981-2024(tc).csv";
    readonly smwPage: "https://www.labour.gov.hk/eng/news/mwo.htm";
    readonly smwPressRelease: "https://www.info.gov.hk/gia/general/202505/01/P2025042900231.htm";
    readonly rvdPriceCsv: "https://www.rvd.gov.hk/datagovhk/1.4M.csv";
    readonly rvdRentCsv: "https://www.rvd.gov.hk/datagovhk/1.3M.csv";
    readonly rvdCompletionsCsv: "https://www.rvd.gov.hk/datagovhk/Dom_Completions_and_Forecast_Completions_by_District_Eng.csv";
    readonly fstbOverviewCsv: "https://www.fstb.gov.hk/datagovhk/tsyb/financial-statistics/tc/fin-stats_overview_a_tc.csv";
    readonly hkmaInterbankLiquidity: "https://api.hkma.gov.hk/public/market-data-and-statistics/daily-monetary-statistics/daily-figures-interbank-liquidity";
};
export declare const cardDefinitions: readonly [{
    readonly id: "employment";
    readonly title_tc: "就業";
}, {
    readonly id: "inflation";
    readonly title_tc: "通脹";
}, {
    readonly id: "gdp";
    readonly title_tc: "GDP";
}, {
    readonly id: "consumption-travel";
    readonly title_tc: "消費與旅遊";
}, {
    readonly id: "minimum-wage";
    readonly title_tc: "最低工資";
}, {
    readonly id: "population";
    readonly title_tc: "人口";
}, {
    readonly id: "housing";
    readonly title_tc: "住屋";
}, {
    readonly id: "fiscal";
    readonly title_tc: "公共財政";
}, {
    readonly id: "interest-rates";
    readonly title_tc: "利率";
}];
export declare const metricConfigs: Record<string, MetricBaseConfig>;
