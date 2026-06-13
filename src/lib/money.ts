/** Money is stored as integer minor units (kopecks/cents). Never use floats for storage. */

export function formatMinor(minor: number, currency = "RUB"): string {
  const major = (minor ?? 0) / 100;
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${major.toFixed(2)} ${currency}`;
  }
}

/** Parse a human amount ("450", "1 250,50", "99.9") into integer minor units. */
export function parseAmountToMinor(input: string | number): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.round(input * 100) : null;
  }
  const cleaned = input.replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const val = Number(cleaned);
  if (!Number.isFinite(val)) return null;
  return Math.round(val * 100);
}
