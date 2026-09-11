import { z } from "zod";

export const travelerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Valid phone number with country code is required"),
  passportNumber: z.string().min(6, "Passport number is required for permits"),
  nationality: z.string().min(2, "Nationality is required"),
  dateOfBirth: z.string().min(4, "Date of birth is required"),
  dietaryRequirements: z.string().optional(),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(6, "Emergency contact phone is required"),
});

export const bookingFormSchema = z.object({
  trekSlug: z.string(),
  departureDate: z.string().min(1, "Please select a departure date"),
  travelerCount: z.coerce.number().int().min(1, "At least 1 traveler required").max(16),
  privateTrek: z.boolean().default(false),
  addPorterService: z.boolean().default(false),
  addSleepingBagRental: z.boolean().default(false),
  addSingleSupplement: z.boolean().default(false),
  primaryContact: travelerSchema,
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
