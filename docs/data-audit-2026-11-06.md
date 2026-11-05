# Data and chart audit — 6 November 2026 (Hong Kong)

The dashboard retains all 32 metric IDs and all 11 cards. No statistic was added, removed, or redefined.

## Corrections

- RVD changed monthly dates to `MM-YYYY`. Those strings were sorted lexically, leaving December 2025 as the headline. Normalize to ISO month-end dates before ordering. September 2026 values are 320.8 (price) and 212.2 (rent).
- Birth registrations previously bypassed the live feed and used a 2021–2024 fixture. Decode the official Big5 CSV and its `出生登記數目` header. The live feed includes 31,714 registrations for 2025 and revisions to earlier years. Failures now enter the normal preserved-snapshot path instead of claiming the fixture is live.
- Minimum-wage page wording changed. Parse the new wording, yielding HK$43.1 effective 1 May 2026. The existing “next rate” statistic remains present but shows “尚未公布” when no future rate is announced, instead of showing an already-effective rate as upcoming.
- Visitor arrivals now explicitly select monthly frequency; annual totals cannot enter the monthly history.
- Current-account balance uses the same official C&SD table 315-37003, component CRA, quarterly BOP amount through its full-series API. This replaces the nine-quarter PDF extraction, extends history, and preserves official precision (2026 Q2: HK$96,030.883 million; the PDF rounded to 96,031).
- HKMA requests paginate beyond the default 100 rows. Daily rates request up to 3,000 observations; M3 retains its recent monthly HKMA values and adds older official quarter-end observations from C&SD 340-45011 (all-currency M3, in HK$ million). This extends the quarterly and yearly views without substituting annual values for current monthly observations.
- Prior-year comparisons clamp 29 February to the previous February's last day.
- Daily builds restore the last published canonical snapshot before fetching. Source outages therefore retain the last deployed data instead of reverting to the repository's March snapshot. Requests have timeouts, one retry, shared responses, and bounded concurrency.

## Chart behavior

Each non-empty chart offers 1, 3, and 10 years where ten yearly points exist. Otherwise its longest option is **7 years**, even if eight or nine years are available. All ranges are anchored to the latest observation, including explicitly labelled forecasts/budgets.

- **1 year:** 12 monthly points if available; otherwise up to 4 quarterly points. Annual data retain their native yearly frequency.
- **3 years:** 12 quarterly points if available; otherwise up to 3 yearly points.
- **10 years:** 10 yearly points. The seven-year fallback uses up to 7 yearly points; shorter histories show only actual observations.
- Each period selects its last available observation. Original tooltip periods and values are retained; no new totals or averages are calculated. Missing periods are not invented or compressed.
- Axis labels are thinned to at most six, independently of the 10 or 12 plotted points.
- The generator retains ten calendar years of chart history. HKMA pagination stops when this horizon is covered; if an older page fails after seven years were successfully fetched, the UI uses the seven-year cap. M3 uses older official quarterly history to support its three-year view.
- Private completions currently expose only three years in the configured source; the current minimum-wage page supplies only the prevailing event.

## Verification

The audit inspected every metric definition, official adapter, fetched observation series, transformations, units, comparisons, and deployed status. Automated checks preserve the metric inventory and compare every live chart point with its fetched source observation. Historical March regression snapshots are frozen fixtures; live invariants now accept legitimate new periods instead of requiring March's values.

The local preview HTTP check and production build pass. Browser automation timed out, so visual interaction QA is not claimed. Some official endpoints timed out or returned HTTP 405 from the local machine; those retained values were explicitly marked as fallback, and the deployment runner refresh is checked separately.

Official references: [RVD price CSV](https://www.rvd.gov.hk/datagovhk/1.4M.csv), [birth registrations CSV](https://www.immd.gov.hk/opendata/hkt/law-and-security/personal_documentation/statistics_on_births_registration.csv), [Labour Department](https://www.labour.gov.hk/eng/news/mwo.htm), [current-account API](https://www.censtatd.gov.hk/api/get.php?full_series=1&id=315-37003&lang=tc), [HKMA API pagination](https://apidocs.hkma.gov.hk/chi/documentation/).

## Final deployed verification

[Deployment 42076431836](https://github.com/martinmtt0902/hong-kong-economic-dashboard/actions/runs/42076431836) succeeded at 01:38 HKT on 6 November 2026. All 45 tests and the production build passed. The live page references the verified `index-obEf0qPI.js` bundle.

The live payload has all 32 unchanged statistics: 31 successfully fetched current values, no source errors, and the existing next-minimum-wage statistic correctly marked unannounced. **29 charts support ten yearly points.** The other histories are limited to one current minimum-wage event, no announced next event, and three years of private completions. They use the seven-year maximum option where a chart exists, displaying only actual observations. Annual and half-yearly sources retain fewer points in a one-year view because monthly/quarterly observations are unavailable.

The table records deployed values and periods; successful retrieval does not mean all statistics share the same release period. Each quarterly/yearly chart point is the last available observation in that bucket, without changing its original unit or computing a sum/average.

| Statistic | Deployed value | Official period | 1-year points | 3-year points | Longest view |
| --- | --- | --- | --- | --- | --- |
| 失業率 | 3.9% | 2026年7月–2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 就業不足率 | 2.0% | 2026年7月–2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 勞動人口 | 3,810,000 | 2026年7月–2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 勞動人口參與率 | 56.6% | 2026年7月–2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 職位空缺數 | 45,380 | 2026年第2季 | 4 quarter | 12 quarter | 10 years / 10 points |
| 從業人士實質平均薪金指數 | 128.2 | 2026年第2季 | 4 quarter | 12 quarter | 10 years / 10 points |
| 月薪中位數 | 21,200元 | 2025年 | 1 year | 3 year | 10 years / 10 points |
| 時薪中位數 | 85.7元/小時 | 2025年 | 1 year | 3 year | 10 years / 10 points |
| 綜合 CPI 按年變動 | +1.9% | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 實質增長 | +4.3% | 2026年第2季 | 4 quarter | 12 quarter | 10 years / 10 points |
| 名義增長 | +6.9% | 2026年第2季 | 4 quarter | 12 quarter | 10 years / 10 points |
| 經常賬戶差額 | 順差 960.3億 | 2026年第2季 | 4 quarter | 12 quarter | 10 years / 10 points |
| 私人消費開支（PCE） | +2.8% | 2026年第2季 | 4 quarter | 12 quarter | 10 years / 10 points |
| 整體出口貨值 | 7625.7億 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 進口貨值 | 8089.0億 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 有形貿易差額 | 逆差 463.3億 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 零售銷售額 | 333.6億 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 旅客入境 | 5,456,320 | 2026年8月 | 12 month | 12 quarter | 10 years / 10 points |
| 現行法定最低工資 | HK$43.1/小時 | 2026-05-01 | 1 quarter | 1 year | 7 years / 1 points |
| 下一個法定最低工資 | 尚未公布 | 待官方更新 | 0 year | 0 year | 7 years / 0 points |
| 人口總量 | 7,518,300 | 2026年年中 | 2 quarter | 3 year | 10 years / 10 points |
| 出生登記總數 | 31,714 | 2025年 | 1 year | 3 year | 10 years / 10 points |
| 年齡中位數 | 48.8 歲 | 2026年 | 1 year | 3 year | 10 years / 10 points |
| 私樓售價指數 | 320.8 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 私樓租金指數 | 212.2 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
| 私人住宅落成量 | 20,098 | 2026年（預測） | 1 year | 3 year | 7 years / 3 points |
| 收入 | 7652.3億 | 2026-27 (原來預算) | 1 year | 3 year | 10 years / 10 points |
| 支出 | 8434.2億 | 2026-27 (原來預算) | 1 year | 3 year | 10 years / 10 points |
| 儲備 | 6876.5億 | 2026-27 (原來預算) | 1 year | 3 year | 10 years / 10 points |
| HKMA Base Rate | 4.3% | 2026-11-05 | 12 month | 12 quarter | 10 years / 10 points |
| 1個月 HIBOR | 2.6% | 2026-11-05 | 12 month | 12 quarter | 10 years / 10 points |
| 貨幣供應 M3 | 22.3萬億 | 2026年9月 | 12 month | 12 quarter | 10 years / 10 points |
