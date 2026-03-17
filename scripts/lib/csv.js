export function parseCsv(text) {
    const lines = text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
        return [];
    }
    const rows = lines.map(parseCsvLine);
    const headers = rows[0].map((header, index) => header.trim() || `column_${index}`);
    return rows.slice(1).map((cells) => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = cells[index]?.trim() ?? "";
        });
        return record;
    });
}
function parseCsvLine(line) {
    const cells = [];
    let current = "";
    let insideQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        const nextCharacter = line[index + 1];
        if (character === '"') {
            if (insideQuotes && nextCharacter === '"') {
                current += '"';
                index += 1;
                continue;
            }
            insideQuotes = !insideQuotes;
            continue;
        }
        if (character === "," && !insideQuotes) {
            cells.push(current);
            current = "";
            continue;
        }
        current += character;
    }
    cells.push(current);
    return cells;
}
