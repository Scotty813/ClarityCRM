import { describe, expect, it } from "vitest";
import { formatCompactCurrency, formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("returns dash for null", () => {
    expect(formatCurrency(null)).toBe("\u2014");
  });
  it("formats a number with commas", () => {
    expect(formatCurrency(500000)).toBe("$500,000");
  });
});

describe("formatCompactCurrency", () => {
  it("returns dash for null", () => {
    expect(formatCompactCurrency(null)).toBe("\u2014");
  });
  it("delegates to formatCurrency below 1M", () => {
    expect(formatCompactCurrency(500000)).toBe("$500,000");
    expect(formatCompactCurrency(0)).toBe("$0");
    expect(formatCompactCurrency(999999)).toBe("$999,999");
  });
  it("shows whole millions without decimal", () => {
    expect(formatCompactCurrency(1000000)).toBe("$1M");
    expect(formatCompactCurrency(5000000)).toBe("$5M");
  });
  it("shows one decimal for fractional millions", () => {
    expect(formatCompactCurrency(2500000)).toBe("$2.5M");
    expect(formatCompactCurrency(30600000)).toBe("$30.6M");
  });
  it("handles exact boundary at 1M", () => {
    expect(formatCompactCurrency(1000000)).toBe("$1M");
  });
  it("shows whole billions without decimal", () => {
    expect(formatCompactCurrency(1000000000)).toBe("$1B");
    expect(formatCompactCurrency(5000000000)).toBe("$5B");
  });
  it("shows one decimal for fractional billions", () => {
    expect(formatCompactCurrency(2500000000)).toBe("$2.5B");
    expect(formatCompactCurrency(10300000000)).toBe("$10.3B");
  });
});
