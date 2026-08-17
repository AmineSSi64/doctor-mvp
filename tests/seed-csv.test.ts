import { describe, it, expect } from "vitest";
import { parseDateKey } from "../prisma/seed-lib/csv";

describe("parseDateKey", () => {
  it("parses a YYYYMMDD string into the correct calendar date", () => {
    const d = parseDateKey("20260315");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // March = index 2
    expect(d.getDate()).toBe(15);
  });

  it("handles a numeric-looking value the same way", () => {
    const d = parseDateKey("20250101");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });
});
