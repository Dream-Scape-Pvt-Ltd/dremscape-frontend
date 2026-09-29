"use server";

import { bookingFormSchema, type BookingFormInput } from "../schemas";
import type { BookingConfirmation } from "../types";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: BookingConfirmation;
};

export async function createBookingAction(
  prevState: ActionState,
  formData: BookingFormInput
): Promise<ActionState> {
  const result = bookingFormSchema.safeParse(formData);

  if (!result.success) {
    const formattedErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      formattedErrors[issue.path.join(".")] = issue.message;
    });
    return {
      success: false,
      message: "Please correct the form fields highlighted below.",
      errors: formattedErrors,
    };
  }

  // Generate simulated booking reference & confirmation
  const randomRef = `DST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    success: true,
    message: "Your expedition booking reservation has been successfully initiated!",
    data: {
      reference: randomRef,
      trekTitle: result.data.trekSlug.replace(/-/g, " ").toUpperCase(),
      departureDate: result.data.departureDate,
      travelerCount: result.data.travelerCount,
      totalAmountUSD: result.data.travelerCount * 2150,
      depositDueUSD: result.data.travelerCount * 400,
      status: "pending_deposit",
    },
  };
}
