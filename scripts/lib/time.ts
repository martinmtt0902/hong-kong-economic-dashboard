export function numericValue(raw: string | number | undefined | null): number | undefined {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : undefined;
  }

  if (!raw) {
    return undefined;
  }

  const cleaned = raw.replace(/,/g, "").replace(/%/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned.toLowerCase() === "na") {
    return undefined;
  }

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}
