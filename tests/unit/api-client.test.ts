import { describe, it, expect } from "vitest";
import { ApiClientError } from "@/lib/api/errors";

describe("ApiClientError", () => {
  it("correctly identifies HTTP 401 unauthorized", () => {
    const error = new ApiClientError("Token expired", 401);
    expect(error.isUnauthorized).toBe(true);
    expect(error.isNotFound).toBe(false);
  });

  it("correctly identifies HTTP 404 not found", () => {
    const error = new ApiClientError("Trek not found", 404);
    expect(error.isNotFound).toBe(true);
  });

  it("extracts field errors from DRF response schemas", () => {
    const error = new ApiClientError("Validation error", 400, {
      traveler_count: ["Ensure this value is greater than or equal to 1."],
      email: ["Enter a valid email address."],
    });

    const fieldErrors = error.getFieldErrors();
    expect(fieldErrors.traveler_count).toBe("Ensure this value is greater than or equal to 1.");
    expect(fieldErrors.email).toBe("Enter a valid email address.");
  });
});
