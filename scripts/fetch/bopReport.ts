import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchBytes } from "../lib/http";
import { parseOfficialPeriod } from "../lib/period";
import type { RawObservation, SourceRef } from "../lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parserPath = path.join(__dirname, "parse_bop_report.py");

type BopReportConfig = {
  source: SourceRef;
  ecode: string;
  table_id: string;
  series_label_tc: string;
  referenceDate: string;
};

type ParsedReport = {
  release_date?: string;
  periods: string[];
  values: number[];
};

export async function fetchBopCurrentAccountObservations(config: BopReportConfig): Promise<RawObservation[]> {
  const report = await fetchLatestBopReport(config.ecode, config.referenceDate);
  const tempDir = path.join(process.cwd(), "tmp", "pdfs");
  await mkdir(tempDir, { recursive: true });

  const pdfPath = path.join(tempDir, `bop-current-account-${report.code}.pdf`);
  await writeFile(pdfPath, report.bytes);

  const parsed = parsePdf(pdfPath);

  return parsed.periods
    .map((periodRaw, index) => {
      const parsedPeriod = parseOfficialPeriod(periodRaw, "quarterly");
      return {
        source: {
          ...config.source,
          api_url: report.url
        },
        series_id: ["official_report_pdf", config.ecode, config.table_id, "Current account"].join("|"),
        series_label_tc: config.series_label_tc,
        frequency: "quarterly" as const,
        dimensions: { BOP_COMPONENT: "CRA", freq: "Q" },
        measure_code: "BOP",
        measure_aliases: ["BOP"],
        measure_label_tc: "HK$ million",
        period_raw: periodRaw,
        as_of_date: parsedPeriod.as_of_date,
        as_of_label: parsedPeriod.as_of_label,
        release_date: parsed.release_date,
        value: parsed.values[index],
        unit: "百萬港元",
        provisional: true
      } satisfies RawObservation;
    })
    .sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}

async function fetchLatestBopReport(ecode: string, referenceDate: string) {
  for (const candidate of quarterCandidates(referenceDate, 12)) {
    const url = reportUrl(ecode, candidate.year, candidate.quarter);
    try {
      const bytes = await fetchBytes(url);
      return {
        url,
        bytes,
        code: `${candidate.year}QQ${String(candidate.quarter).padStart(2, "0")}`
      };
    } catch {
      continue;
    }
  }

  throw new Error("Unable to fetch a recent BoP quarterly report PDF");
}

function parsePdf(pdfPath: string): ParsedReport {
  const result = spawnSync("python3", [parserPath, pdfPath], {
    encoding: "utf-8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || "Failed to parse BoP report PDF");
  }

  return JSON.parse(result.stdout) as ParsedReport;
}

function quarterCandidates(referenceDate: string, count: number) {
  const [yearText, monthText] = referenceDate.split("-");
  let year = Number(yearText);
  let quarter = Math.ceil(Number(monthText) / 3);
  const candidates: Array<{ year: number; quarter: number }> = [];

  for (let index = 0; index < count; index += 1) {
    candidates.push({ year, quarter });
    quarter -= 1;
    if (quarter === 0) {
      quarter = 4;
      year -= 1;
    }
  }

  return candidates;
}

function reportUrl(ecode: string, year: number, quarter: number): string {
  const issue = `${ecode}${year}QQ${String(quarter).padStart(2, "0")}`;
  return `https://www.censtatd.gov.hk/wbr/${ecode}/${issue}/att/en/${issue}.pdf`;
}
