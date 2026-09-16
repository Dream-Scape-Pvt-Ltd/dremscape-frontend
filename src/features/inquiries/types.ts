export interface InquiryPayload {
  name: string;
  email: string;
  phone: string;
  destination: string;
  regionInterest?: string;
  travelerCount: number;
  estimatedMonthYear: string;
  estimatedDurationDays: number;
  fitnessLevel: "beginner" | "moderate" | "advanced" | "mountaineer";
  customNotes?: string;
}
