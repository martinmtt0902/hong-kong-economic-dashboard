import { fetchCsvSeries } from "./csvSource";
const IMMD_URL = "https://www.immd.gov.hk/opendata/eng/transport/immigration_clearance_statistics_daily_passenger_traffic.csv";
export async function fetchVisitorArrivalsFromImmd() {
    const dailyPoints = await fetchCsvSeries({
        url: IMMD_URL,
        frequency: "daily",
        unit: "人次",
        dateColumns: ["date"],
        rowFilter: (row) => {
            const joined = Object.values(row).join(" ").toLowerCase();
            return joined.includes("arrivals") && (joined.includes("visitor") || joined.includes("mainland"));
        },
        valueSelector: (row) => {
            const candidates = Object.entries(row)
                .filter(([key]) => /(count|number|passenger|人次|總數)/i.test(key))
                .map(([, value]) => value);
            const numeric = candidates
                .map((value) => Number(value.replace(/,/g, "")))
                .filter((value) => Number.isFinite(value));
            return numeric[0];
        }
    });
    const monthly = new Map();
    dailyPoints.forEach((point) => {
        const monthKey = point.date.slice(0, 7);
        const existing = monthly.get(monthKey);
        if (existing) {
            existing.value += point.value;
            return;
        }
        monthly.set(monthKey, {
            period_key: monthKey,
            label_tc: `${point.date.slice(0, 4)}年${Number(point.date.slice(5, 7))}月`,
            date: `${monthKey}-01T00:00:00.000Z`,
            value: point.value,
            unit: "人次"
        });
    });
    return Array.from(monthly.values()).sort((left, right) => left.date.localeCompare(right.date));
}
