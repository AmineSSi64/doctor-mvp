import { describe, it, expect } from "vitest";
import { normalizeTunisianPhone } from "@/lib/phone";

describe("normalizeTunisianPhone", () => {
  it.each([
    ["+216 29 526 066", "+216 29 526 066"],
    ["+21629526066", "+216 29 526 066"],
    ["+216 29526066", "+216 29 526 066"], // the exact input from the bug report
    ["216 29 526 066", "+216 29 526 066"],
    ["00216 29 526 066", "+216 29 526 066"],
    ["29 526 066", "+216 29 526 066"],
    ["29526066", "+216 29 526 066"],
    ["29-526-066", "+216 29 526 066"],
    ["  29526066  ", "+216 29 526 066"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeTunisianPhone(input)).toBe(expected);
  });

  it.each([
    ["12345", "too short"],
    ["295260661234", "too long"],
    ["2952606a", "contains a letter"],
    ["", "empty"],
    ["+33 6 12 34 56 78", "wrong country code (French number)"],
  ])("rejects %s (%s)", (input) => {
    expect(normalizeTunisianPhone(input)).toBeNull();
  });
});
