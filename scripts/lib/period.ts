import type { Frequency } from "./types";

type ParsedPeriod = {
  period_key: string;
  as_of_date: string;
  as_of_label: string;
};

const monthNamesTc = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function parseOfficialPeriod(raw: string, frequency: Frequency): ParsedPeriod {
  const text = raw.trim();

  if (frequency === "daily") {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      return {
        period_key: text.slice(0, 10),
        as_of_date: isoDate(date),
        as_of_label: text.slice(0, 10)
      };
    }
  }

  if (frequency === "event") {
    const eventDate = parseStrictEventDate(text);
    if (eventDate) {
      return {
        period_key: eventDate,
        as_of_date: eventDate,
        as_of_label: eventDate
      };
    }
  }

  if (/^\d{6}$/.test(text)) {
    const year = Number(text.slice(0, 4));
    const month = Number(text.slice(4, 6));

    if (frequency === "monthly") {
      return {
        period_key: `${year}-${String(month).padStart(2, "0")}`,
        as_of_date: monthEndIso(year, month),
        as_of_label: `${year}年${month}月`
      };
    }

    if (frequency === "quarterly" && [3, 6, 9, 12].includes(month)) {
      const quarter = month / 3;
      return {
        period_key: `${year}-Q${quarter}`,
        as_of_date: monthEndIso(year, month),
        as_of_label: `${year}年第${quarter}季`
      };
    }

    if (frequency === "half_yearly" && [6, 12].includes(month)) {
      return {
        period_key: `${year}-${String(month).padStart(2, "0")}`,
        as_of_date: monthEndIso(year, month),
        as_of_label: month === 6 ? `${year}年年中` : `${year}年年底`
      };
    }
  }

  if (frequency === "annual") {
    const yearMatch = text.match(/(?<!\d)(\d{4})(?!\d)/);
    if (yearMatch) {
      const startYear = Number(yearMatch[1]);
      const fiscalMatch = text.match(/(?<start>\d{4})[-/](?<end>\d{2,4})/);
      if (fiscalMatch?.groups) {
        const rawEnd = fiscalMatch.groups.end;
        const endYear = rawEnd.length === 2 ? Number(`${String(startYear).slice(0, 2)}${rawEnd}`) : Number(rawEnd);
        return {
          period_key: `${startYear}-${endYear}`,
          as_of_date: isoDate(new Date(Date.UTC(endYear, 2, 31))),
          as_of_label: text
        };
      }
      return {
        period_key: `${startYear}`,
        as_of_date: isoDate(new Date(Date.UTC(startYear, 11, 31))),
        as_of_label: `${startYear}年`
      };
    }
  }

  if (frequency === "monthly") {
    const match = text.match(/(?<month>[A-Za-z]{3})[- ](?<year>\d{2,4})/);
    if (match?.groups) {
      const year =
        match.groups.year.length === 2
          ? Number(`19${match.groups.year}`) < 1970
            ? 2000 + Number(match.groups.year)
            : 1900 + Number(match.groups.year)
          : Number(match.groups.year);
      const month = monthFromEnglish(match.groups.month);
      return {
        period_key: `${year}-${String(month).padStart(2, "0")}`,
        as_of_date: monthEndIso(year, month),
        as_of_label: `${year}年${month}月`
      };
    }
  }

  return {
    period_key: text,
    as_of_date: text,
    as_of_label: text
  };
}

export function formatRollingWindowLabel(periodRaw: string): string {
  if (!/^\d{6}$/.test(periodRaw)) {
    return periodRaw;
  }

  const endYear = Number(periodRaw.slice(0, 4));
  const endMonth = Number(periodRaw.slice(4, 6));
  const start = addMonths(endYear, endMonth, -2);

  return `${start.year}年${start.month}月–${endYear}年${endMonth}月`;
}

export function formatRollingWindowLabelCompact(periodRaw: string): string {
  if (!/^\d{6}$/.test(periodRaw)) {
    return periodRaw;
  }

  const endYear = Number(periodRaw.slice(0, 4));
  const endMonth = Number(periodRaw.slice(4, 6));
  const start = addMonths(endYear, endMonth, -2);

  if (start.year === endYear) {
    return `${start.year}年${start.month}月–${endMonth}月`;
  }

  return `${start.year}年${start.month}月–${endYear}年${endMonth}月`;
}

export function periodEndDateForRollingWindow(periodRaw: string): string {
  if (!/^\d{6}$/.test(periodRaw)) {
    return periodRaw;
  }
  const year = Number(periodRaw.slice(0, 4));
  const month = Number(periodRaw.slice(4, 6));
  return monthEndIso(year, month);
}

export function formatDailyLabel(dateString: string): string {
  return dateString.slice(0, 10);
}

export function frequencyRank(frequency: Frequency): number {
  switch (frequency) {
    case "daily":
      return 6;
    case "monthly":
      return 5;
    case "quarterly":
      return 4;
    case "half_yearly":
      return 3;
    case "annual":
      return 2;
    case "event":
      return 1;
    default:
      return 0;
  }
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(dateString: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  return dateString;
}

export function formatComparisonPeriodLabel(asOfLabel: string, comparisonType: string, periodRaw?: string): string {
  if (comparisonType === "previous_rolling_window" && periodRaw) {
    return formatRollingWindowLabelCompact(periodRaw);
  }
  if (asOfLabel.endsWith("年年底")) {
    return asOfLabel.replace("年年底", "年底");
  }
  if (asOfLabel.endsWith("年年中")) {
    return asOfLabel.replace("年年中", "年中");
  }
  return asOfLabel;
}

export function formatTickLabel(asOfLabel: string, frequency: Frequency): string {
  switch (frequency) {
    case "daily":
      return asOfLabel;
    case "monthly": {
      const match = asOfLabel.match(/(\d{4})年(\d{1,2})月/);
      return match ? `${match[1]}-${match[2].padStart(2, "0")}` : asOfLabel;
    }
    case "quarterly": {
      const match = asOfLabel.match(/(\d{4})年第(\d)季/);
      return match ? `${match[1]}Q${match[2]}` : asOfLabel;
    }
    case "half_yearly":
      return asOfLabel.replace("年年中", "H1").replace("年年底", "H2");
    case "annual": {
      if (/^\d{4}[-/]\d{2,4}/.test(asOfLabel)) {
        return asOfLabel;
      }
      const match = asOfLabel.match(/(\d{4})/);
      return match ? match[1] : asOfLabel;
    }
    case "event":
      return asOfLabel;
    default:
      return asOfLabel;
  }
}

export function parseStrictEventDate(text: string): string | undefined {
  const normalized = text.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const match = normalized.match(/^(?<day>\d{1,2})\s+(?<month>[A-Za-z]+)\s+(?<year>\d{4})$/);
  if (!match?.groups) {
    return undefined;
  }

  const month = monthFromEnglish(match.groups.month);
  if (!month) {
    return undefined;
  }

  return `${match.groups.year}-${String(month).padStart(2, "0")}-${String(Number(match.groups.day)).padStart(2, "0")}`;
}

function monthEndIso(year: number, month: number): string {
  return isoDate(new Date(Date.UTC(year, month, 0)));
}

function monthFromEnglish(value: string): number {
  const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(
    value.slice(0, 3)
  );
  return monthIndex + 1;
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1
  };
}

export function comparisonBasisLabel(basis: string): string {
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

export function previousBasisLabel(basis: string): string {
  switch (basis) {
    case "previous_observation":
      return "上期";
    case "same_period_last_year":
      return "去年同月";
    case "previous_rolling_window":
      return "上一個三個月移動窗";
    case "event_previous_effective":
      return "上一次生效值";
    default:
      return "上期";
  }
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${monthNamesTc[month - 1]}`;
}
