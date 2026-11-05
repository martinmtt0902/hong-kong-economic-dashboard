# Source Map

The 32 statistics and 11 cards are fixed. Exact selectors, units, and comparison rules are in `scripts/lib/metric-definition.ts`.

| Card | Existing statistics | Official source / selection |
| --- | --- | --- |
| Employment | Unemployment, underemployment, labour force, participation rate, vacancies | C&SD 210-06101 and 210-06201 rolling three-month observations; 215-16007 quarterly survey reference months |
| Wages and income | Real payroll index, median monthly wage, median hourly wage | C&SD 220-19024, 220-23011, 220-23024; retain Labour Earnings Survey / AEHS distinctions |
| Inflation | Composite CPI year-on-year change | C&SD 510-60001A, official percentage-change measure; do not calculate YoY again |
| GDP | Real GDP growth, nominal GDP growth, current-account balance, private-consumption growth | C&SD 310-31003, 310-31002, 315-37003 (CRA / Q / BOP), 310-31012; growth measures use official YoY series |
| External trade | Exports, imports, visible trade balance | C&SD 410-50001 monthly amounts; retain sign-aware balance rendering |
| Consumption and travel | Retail sales value, visitor arrivals | C&SD 620-67001 and 650-80001; visitor arrivals explicitly select `freq=M` |
| Minimum wage | Current statutory rate, next announced rate | Labour Department SMW page; compare effective dates with the run date; no future announcement means “尚未公布” |
| Population | Population, birth registrations, median age | C&SD 110-01002 and 110-01004; Immigration Department live Big5 birth-registration CSV (not DH known births) |
| Housing | Private domestic price index, rent index, completions | RVD CSVs; normalize `MM-YYYY` months; preserve forecast labels for completions |
| Fiscal | Government revenue, expenditure, fiscal reserves | FSTB financial overview CSV; fiscal years and original-budget labels are retained |
| Monetary and financial | Base rate, one-month HIBOR, M3 | HKMA daily interbank liquidity and monthly monetary statistics APIs; paginated daily history and C&SD 340-45011 quarter-end M3 history |

## History and fallback

- Retain ten calendar years for charting (all available effective-date observations for event series).
- Per-statistic choices are 1, 3, and 10 years when ten yearly observations exist; otherwise the longest choice is capped at 7 years. Shorter sources show only their available observations.
- One year: 12 monthly points where available, otherwise up to 4 quarterly points. Annual sources retain their yearly frequency.
- Three years: 12 quarterly points where available, otherwise up to 3 yearly points.
- Ten years: 10 yearly points. Each bucket takes its last actual observation, preserving the original period/value; no sums or averages are computed.
- No missing observations are invented or compressed. Axis labels are thinned to six while all data points remain accessible.
- Restore the most recent published canonical snapshot before scheduled generation. A failed fetch retains the prior value with an explicit fallback status, never a false live badge.
- Every deployment runs frozen historical snapshots plus live data, parser, chart-range, and inventory checks.

See the [6 November 2026 audit](data-audit-2026-11-06.md) for findings and verification limits.
