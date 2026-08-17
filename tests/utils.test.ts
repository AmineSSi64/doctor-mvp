import { describe, it, expect } from "vitest";
import { calculateAge, ageGroup, initials, totalPrescriptionQuantity } from "@/lib/utils";

describe("calculateAge", () => {
  it("returns 0 for a baby born this year", () => {
    const now = new Date("2026-08-13");
    expect(calculateAge("2026-02-01", now)).toBe(0);
  });

  it("computes a standard adult age correctly", () => {
    const now = new Date("2026-08-13");
    expect(calculateAge("1990-01-15", now)).toBe(36);
  });

  it("has not had this year's birthday yet", () => {
    const now = new Date("2026-08-13");
    // Birthday is 20 Aug — hasn't happened yet relative to "now".
    expect(calculateAge("1985-08-20", now)).toBe(40);
  });

  it("has already had this year's birthday", () => {
    const now = new Date("2026-08-13");
    // Birthday was 1 Jan — already happened this year.
    expect(calculateAge("1985-01-01", now)).toBe(41);
  });
});

describe("ageGroup", () => {
  it.each([
    [5, "0-17"],
    [17, "0-17"],
    [18, "18-35"],
    [35, "18-35"],
    [36, "36-50"],
    [50, "36-50"],
    [51, "51-65"],
    [65, "51-65"],
    [66, "65+"],
    [90, "65+"],
  ])("maps age %i to bucket %s", (age, expected) => {
    expect(ageGroup(age)).toBe(expected);
  });
});

describe("initials", () => {
  it("uppercases the first letter of each name", () => {
    expect(initials("mariem", "ben amor")).toBe("MB");
  });
});

describe("totalPrescriptionQuantity", () => {
  it("sums quantity across items", () => {
    expect(
      totalPrescriptionQuantity([{ quantity: 10 }, { quantity: 21 }, { quantity: 3 }])
    ).toBe(34);
  });

  it("returns 0 for an empty list", () => {
    expect(totalPrescriptionQuantity([])).toBe(0);
  });
});
