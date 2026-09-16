import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Your full name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Phone number is required"),
  destination: z.string().min(1, "Please select a destination"),
  regionInterest: z.string().optional(),
  travelerCount: z.coerce.number().min(1).max(30).default(2),
  estimatedMonthYear: z.string().min(2, "Estimated month & year required"),
  estimatedDurationDays: z.coerce.number().min(3).max(60).default(14),
  fitnessLevel: z.enum(["beginner", "moderate", "advanced", "mountaineer"]).default("moderate"),
  customNotes: z.string().max(2000).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
