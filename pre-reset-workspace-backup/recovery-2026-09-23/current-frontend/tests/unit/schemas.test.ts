import { describe, it, expect } from "vitest";
import { trekFilterSchema } from "@/features/treks/schemas";
import { bookingFormSchema } from "@/features/bookings/schemas";
import { inquirySchema } from "@/features/inquiries/schemas";

describe("Trek Filter Schema", () => {
  it("validates valid filter inputs and coerces numbers", () => {
    const parsed = trekFilterSchema.safeParse({
      difficulty: "strenuous",
      minDays: "10",
      maxDays: "20",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.minDays).toBe(10);
      expect(parsed.data.maxDays).toBe(20);
      expect(parsed.data.difficulty).toBe("strenuous");
    }
  });

  it("rejects invalid difficulty values", () => {
    const parsed = trekFilterSchema.safeParse({
      difficulty: "impossible-grade",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("Inquiry Schema", () => {
  it("validates complete inquiry inputs", () => {
    const parsed = inquirySchema.safeParse({
      name: "Tenzing Norgay",
      email: "tenzing@example.com",
      phone: "+977 9851000000",
      destination: "Nepal",
      estimatedMonthYear: "October 2026",
      estimatedDurationDays: 14,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const parsed = inquirySchema.safeParse({
      name: "Tenzing Norgay",
      email: "not-an-email",
      phone: "123456",
      destination: "Nepal",
      estimatedMonthYear: "October 2026",
    });
    expect(parsed.success).toBe(false);
  });
});
