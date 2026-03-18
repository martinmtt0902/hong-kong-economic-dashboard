import { fetchText } from "../lib/http";
import { parseOfficialPeriod } from "../lib/period";
import { URLs } from "../lib/source";
import type { RawObservation, SourceRef } from "../lib/types";

export async function fetchMinimumWageObservations(source: SourceRef, seriesLabel: string): Promise<RawObservation[]> {
  const html = await fetchText(URLs.smwPage);
  const prevailing = html.match(
    /prevailing SMW rate is \$\s*(\d+(?:\.\d+)?) per hour effective from (\d{1,2} \w+ \d{4})/i
  );
  const announced = html.match(
    /raise the SMW rate to \$\s*(\d+(?:\.\d+)?) per hour.*?come into force on (\d{1,2} \w+ \d{4})/is
  );

  if (!prevailing) {
    throw new Error("No prevailing minimum wage rate was found on Labour Department page");
  }

  const points: RawObservation[] = [];

  for (const [index, match] of [prevailing, announced].entries()) {
    if (!match) {
      continue;
    }
    const parsed = parseOfficialPeriod(match[2], "event");
    points.push({
      source,
      series_id: "labour|min_wage",
      series_label_tc: seriesLabel,
      frequency: "event",
      dimensions: {},
      measure_code: "MINIMUM_WAGE",
      measure_aliases: ["MINIMUM_WAGE"],
      measure_label_tc: seriesLabel,
      period_raw: match[2],
      as_of_date: parsed.as_of_date,
      as_of_label: parsed.as_of_label,
      release_date: index === 1 ? "2025-04-29" : undefined,
      effective_date: parsed.as_of_date,
      value: Number(match[1]),
      unit: "港元/小時",
      provisional: index === 1
    });
  }

  return points.sort((left, right) => left.as_of_date.localeCompare(right.as_of_date));
}
