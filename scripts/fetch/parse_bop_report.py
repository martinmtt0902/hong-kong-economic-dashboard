from __future__ import annotations

import json
import re
import sys
from datetime import datetime

from pypdf import PdfReader


def quarter_to_period_raw(year: int, quarter: int) -> str:
    return f"{year}{quarter * 3:02d}"


def extract_release_date(text: str) -> str | None:
    match = re.search(r"Release Date:\s*([0-9]{1,2} [A-Za-z]+, [0-9]{4})", text)
    if not match:
        return None
    return datetime.strptime(match.group(1), "%d %B, %Y").date().isoformat()


def extract_quarters(text: str) -> list[str]:
    return [quarter_to_period_raw(int(year), int(quarter)) for quarter, year in re.findall(r"Q([1-4])-([0-9]{4})@?", text)]


def extract_row_values(text: str, label: str, count: int) -> list[int]:
    match = re.search(rf"([0-9,\- ]+)\s+{re.escape(label)}", text)
    if not match:
        return []
    values = re.findall(r"-?\d{1,3}(?:,\d{3})*", match.group(1))
    return [int(value.replace(",", "")) for value in values[-count:]]


def main() -> None:
    reader = PdfReader(sys.argv[1])
    page1 = reader.pages[0].extract_text() or ""
    page2 = reader.pages[1].extract_text() or ""
    periods = extract_quarters(page2)
    values = extract_row_values(page2, "Current account", len(periods))

    if not periods or len(periods) != len(values):
        raise SystemExit("Unable to extract current account series from BoP report PDF")

    print(
        json.dumps(
            {
                "release_date": extract_release_date(page1),
                "periods": periods,
                "values": values,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
