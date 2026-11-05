# Data and chart audit — 6 November 2026 (Hong Kong)

The dashboard retains all 32 metric IDs and all 11 cards. No statistic was added, removed, or redefined.

## Corrections

- RVD changed monthly dates to `MM-YYYY`. Those strings were sorted lexically, leaving December 2025 as the headline. Normalize to ISO month-end dates before ordering. September 2026 values are 320.8 (price) and 212.2 (rent).
- Birth registrations previously bypassed the live feed and used a 2021–2024 fixture. Decode the official Big5 CSV and its `出生登記數目` header. The live feed includes 31,714 registrations for 2025 and revisions to earlier years. Failures now enter the normal preserved-snapshot path instead of claiming the fixture is live.
- Minimum-wage page wording changed. Parse the new wording, yielding HK$43.1 effective 1 May 2026. The existing “next rate” statistic remains present but shows “尚未公布” when no future rate is announced, instead of showing an already-effective rate as upcoming.
- Visitor arrivals now explicitly select monthly frequency; annual totals cannot enter the monthly history.
- Current-account balance uses the same official C&SD table 315-37003, component CRA, quarterly BOP amount through its full-series API. This replaces the nine-quarter PDF extraction, extends history, and preserves official precision (2026 Q2: HK$96,030.883 million; the PDF rounded to 96,031).
- HKMA requests paginate beyond the default 100 rows. Daily rates request up to 3,000 observations; M3 up to 1,000 monthly/annual source rows, with annual rows excluded as before.
- Prior-year comparisons clamp 29 February to the previous February's last day.
- Daily builds restore the last published canonical snapshot before fetching. Source outages therefore retain the last deployed data instead of reverting to the repository's March snapshot. Requests have timeouts, one retry, shared responses, and bounded concurrency.

## Chart behavior

Each non-empty chart has 1-, 3-, 5-, and 7-year choices, anchored to its latest available observation (including explicitly labelled forecasts/budgets).

- One year: the latest 12 calendar months for subannual series, at most one observation per month. Quarterly and half-yearly series keep their original frequency. Annual series show their latest year.
- Longer views: the latest 3, 5, or 7 calendar years, one last available observation per year. These are **not annual sums or averages**. The actual original period and value remain in the tooltip.
- Monthly labels are thinned; yearly views show up to seven year labels. Missing periods are not invented or compressed. Insufficient histories show only available observations and state their loaded coverage.
- The generator retains seven calendar years of chart history. Event series keep available effective-date history. Private completions currently expose only three years in the configured source; the current minimum-wage page supplies only the prevailing event.

## Verification

The audit inspected every metric definition, official adapter, fetched observation series, transformations, units, comparisons, and deployed status. Automated checks preserve the metric inventory and compare every live chart point with its fetched source observation. Historical March regression snapshots are frozen fixtures; live invariants now accept legitimate new periods instead of requiring March's values.

The local preview HTTP check and production build pass. Browser automation timed out, so visual interaction QA is not claimed. Some official endpoints timed out or returned HTTP 405 from the local machine; those retained values were explicitly marked as fallback, and the deployment runner refresh is checked separately.

Official references: [RVD price CSV](https://www.rvd.gov.hk/datagovhk/1.4M.csv), [birth registrations CSV](https://www.immd.gov.hk/opendata/hkt/law-and-security/personal_documentation/statistics_on_births_registration.csv), [Labour Department](https://www.labour.gov.hk/eng/news/mwo.htm), [current-account API](https://www.censtatd.gov.hk/api/get.php?full_series=1&id=315-37003&lang=tc), [HKMA API pagination](https://apidocs.hkma.gov.hk/chi/documentation/).
