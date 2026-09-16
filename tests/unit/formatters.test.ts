import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/formatters/currency";
import { metersToFeet, formatElevation, formatDistance } from "@/lib/formatters/geo";
import { formatDate, formatDateRange } from "@/lib/formatters/date";

describe("Currency Formatter", () => {
  it("formats USD correctly by default", () => {
    expect(formatCurrency(2150, "USD")).toBe("$2,150");
  });

  it("converts USD to EUR based on exchange rate", () => {
    expect(formatCurrency(1000, "EUR", { USD: 1, EUR: 0.92, GBP: 0.79, AUD: 1.52, NPR: 133.5 })).toBe("€920");
  });

  it("converts USD to NPR correctly", () => {
    expect(formatCurrency(100, "NPR", { USD: 1, EUR: 0.92, GBP: 0.79, AUD: 1.52, NPR: 133.5 })).toBe("रू13,350");
  });
});

describe("Geo Formatter", () => {
  it("converts meters to feet with precision", () => {
    expect(metersToFeet(5364)).toBe(17598); // Everest Base Camp
    expect(metersToFeet(8848)).toBe(29029); // Mount Everest Summit
  });

  it("formats elevation strings for metric and imperial", () => {
    expect(formatElevation(5364, "metric")).toBe("5,364 m");
    expect(formatElevation(5364, "imperial")).toBe("17,598 ft");
  });

  it("formats distance strings for metric and imperial", () => {
    expect(formatDistance(10, "metric")).toBe("10.0 km");
    expect(formatDistance(10, "imperial")).toBe("6.2 mi");
  });
});

describe("Date Formatter", () => {
  it("formats dates into readable strings", () => {
    expect(formatDate("2026-10-15T00:00:00Z")).toContain("2026");
  });

  it("formats date ranges", () => {
    const range = formatDateRange("2026-10-05", "2026-10-21");
    expect(range).toContain("2026");
  });
});
