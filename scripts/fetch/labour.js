import { fetchText } from "../lib/http";
import { URLs } from "../lib/source";
export async function fetchMinimumWageSeries() {
    const html = await fetchText(URLs.smwPage);
    const prevailing = html.match(/prevailing SMW rate is \$\s*(\d+(?:\.\d+)?) per hour effective from (\d{1,2} \w+ \d{4})/i);
    const announced = html.match(/raise the SMW rate to \$\s*(\d+(?:\.\d+)?) per hour.*?come into force on (\d{1,2} \w+ \d{4})/is);
    if (!prevailing) {
        throw new Error("No prevailing minimum wage rate was found on Labour Department page");
    }
    const points = [
        {
            period_key: prevailing[2],
            label_tc: "現行法定最低工資",
            date: new Date(prevailing[2]).toISOString(),
            value: Number(prevailing[1]),
            unit: "港元/小時"
        }
    ];
    return points;
}
