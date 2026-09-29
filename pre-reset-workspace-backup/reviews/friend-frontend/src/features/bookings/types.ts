export interface TravelerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  dietaryRequirements?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface BookingSubmission {
  trekSlug: string;
  departureDate: string;
  travelerCount: number;
  privateTrek: boolean;
  addPorterService: boolean;
  addSleepingBagRental: boolean;
  addSingleSupplement: boolean;
  primaryContact: TravelerInfo;
}

export interface BookingConfirmation {
  reference: string;
  trekTitle: string;
  departureDate: string;
  travelerCount: number;
  totalAmountUSD: number;
  depositDueUSD: number;
  status: "pending_deposit" | "confirmed" | "completed";
}
