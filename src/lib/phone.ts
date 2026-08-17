/**
 * Normalizes a Tunisian phone number typed in any reasonable format into
 * the canonical "+216 XX XXX XXX" representation, or returns null if the
 * input isn't a valid 8-digit Tunisian number.
 *
 * Accepts (all normalize to "+216 29 526 066"):
 *   "+216 29 526 066"   (already canonical)
 *   "+21629526066"      (no spaces)
 *   "216 29 526 066"    (missing +)
 *   "29 526 066"        (no country code — assumed local)
 *   "29526066"          (digits only)
 *
 * Rejects anything that isn't exactly 8 digits once the optional country
 * code and all separators are stripped — this is deliberately generous
 * about *formatting* while still catching genuinely wrong numbers (too
 * short, too long, letters, etc).
 */
export function normalizeTunisianPhone(input: string): string | null {
  let digits = input.trim().replace(/[\s\-().]/g, "");

  // Strip an optional country code, with or without the leading "+".
  if (digits.startsWith("+216")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("00216")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("216") && digits.length === 11) {
    // Only treat a leading "216" as a country code when the remainder is
    // exactly 8 digits — otherwise a local number that happens to start
    // with 216 would be misread.
    digits = digits.slice(3);
  }

  if (!/^\d{8}$/.test(digits)) {
    return null;
  }

  return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)}`;
}
