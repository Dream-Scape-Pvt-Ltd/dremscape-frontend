"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormMessage } from "@/components/forms/form-field";
import { CounterInput } from "@/components/forms/counter-input";
import { createBookingAction } from "../api/actions";
import type { BookingFormInput } from "../schemas";

interface BookingWizardProps {
  trekSlug: string;
  pricePerPersonUSD: number;
}

export function BookingWizard({ trekSlug, pricePerPersonUSD }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = React.useState<BookingFormInput>({
    trekSlug,
    departureDate: "2026-10-05",
    travelerCount: 2,
    privateTrek: false,
    addPorterService: true,
    addSleepingBagRental: false,
    addSingleSupplement: false,
    primaryContact: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      passportNumber: "",
      nationality: "United States",
      dateOfBirth: "1992-05-14",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  const totalUSD =
    formData.travelerCount * pricePerPersonUSD +
    (formData.addSleepingBagRental ? formData.travelerCount * 60 : 0) +
    (formData.privateTrek ? 350 : 0);

  const depositUSD = formData.travelerCount * 400;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerErrors({});

    const res = await createBookingAction({ success: false }, formData);

    if (res.success && res.data) {
      router.push(`/booking/confirmation/${res.data.reference}`);
    } else if (res.errors) {
      setServerErrors(res.errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Wizard Steps Form */}
      <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between border-b border-stone-100 pb-6">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= 1 ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500"
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-stone-800">Trip Specs</span>
          </div>
          <div className="h-0.5 w-12 bg-stone-200" />
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= 2 ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500"
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-stone-800">Traveler Details</span>
          </div>
          <div className="h-0.5 w-12 bg-stone-200" />
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step === 3 ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500"
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-stone-800">Review & Confirm</span>
          </div>
        </div>

        {/* Step 1: Specs */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900">Select Date & Group Size</h3>

            <FormField>
              <FormLabel required>Departure Date</FormLabel>
              <Input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              />
            </FormField>

            <div className="border-t border-stone-100 pt-4">
              <CounterInput
                label="Number of Trekkers"
                sublabel="Ages 16 and above"
                value={formData.travelerCount}
                onChange={(val) => setFormData({ ...formData, travelerCount: val })}
                min={1}
                max={12}
              />
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privateTrek}
                  onChange={(e) => setFormData({ ...formData, privateTrek: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">
                    Make this a Private Expedition (+ $350 flat)
                  </span>
                  <span className="text-xs text-stone-500">
                    Dedicated Sherpa guide exclusively for your private party.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.addSleepingBagRental}
                  onChange={(e) =>
                    setFormData({ ...formData, addSleepingBagRental: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">
                    Four-Season Down Sleeping Bag Rental (+ $60/person)
                  </span>
                  <span className="text-xs text-stone-500">
                    Rated to -20°C, sanitized and ready in Kathmandu.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={() => setStep(2)}>
                Continue to Traveler Info <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Traveler details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Lead Traveler Information</h3>
            <p className="text-xs text-stone-500">
              Required by Nepal Tourism Board and National Park authorities for trekking permits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>First Name</FormLabel>
                <Input
                  value={formData.primaryContact.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: { ...formData.primaryContact, firstName: e.target.value },
                    })
                  }
                  placeholder="e.g. Maya"
                />
                <FormMessage>{serverErrors["primaryContact.firstName"]}</FormMessage>
              </FormField>

              <FormField>
                <FormLabel required>Last Name</FormLabel>
                <Input
                  value={formData.primaryContact.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: { ...formData.primaryContact, lastName: e.target.value },
                    })
                  }
                  placeholder="e.g. Jenkins"
                />
                <FormMessage>{serverErrors["primaryContact.lastName"]}</FormMessage>
              </FormField>

              <FormField>
                <FormLabel required>Email Address</FormLabel>
                <Input
                  type="email"
                  value={formData.primaryContact.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: { ...formData.primaryContact, email: e.target.value },
                    })
                  }
                  placeholder="name@domain.com"
                />
                <FormMessage>{serverErrors["primaryContact.email"]}</FormMessage>
              </FormField>

              <FormField>
                <FormLabel required>Phone Number (WhatsApp)</FormLabel>
                <Input
                  value={formData.primaryContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: { ...formData.primaryContact, phone: e.target.value },
                    })
                  }
                  placeholder="+1 555-0199"
                />
                <FormMessage>{serverErrors["primaryContact.phone"]}</FormMessage>
              </FormField>

              <FormField>
                <FormLabel required>Passport Number</FormLabel>
                <Input
                  value={formData.primaryContact.passportNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: {
                        ...formData.primaryContact,
                        passportNumber: e.target.value,
                      },
                    })
                  }
                  placeholder="A12345678"
                />
                <FormMessage>{serverErrors["primaryContact.passportNumber"]}</FormMessage>
              </FormField>

              <FormField>
                <FormLabel required>Emergency Contact Name & Phone</FormLabel>
                <Input
                  value={formData.primaryContact.emergencyContactName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryContact: {
                        ...formData.primaryContact,
                        emergencyContactName: e.target.value,
                        emergencyContactPhone: e.target.value,
                      },
                    })
                  }
                  placeholder="Contact Name & Number"
                />
              </FormField>
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Review Summary <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900">Review Booking Details</h3>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Departure:</span>
                <span className="font-bold text-stone-900">{formData.departureDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Trekkers:</span>
                <span className="font-bold text-stone-900">{formData.travelerCount} Person(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Lead Traveler:</span>
                <span className="font-bold text-stone-900">
                  {formData.primaryContact.firstName} {formData.primaryContact.lastName} (
                  {formData.primaryContact.email})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Free cancellation up to 30 days prior to departure. 100% financial protection
                guaranteed.
              </span>
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Confirm Reservation <Check className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Summary Sidebar */}
      <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-fit space-y-6">
        <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3">
          Price Breakdown
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>
              Expedition Base (${pricePerPersonUSD} × {formData.travelerCount})
            </span>
            <span className="font-semibold text-stone-900">
              ${pricePerPersonUSD * formData.travelerCount}
            </span>
          </div>

          {formData.privateTrek && (
            <div className="flex justify-between text-stone-600">
              <span>Private Guide Surcharge</span>
              <span className="font-semibold text-stone-900">$350</span>
            </div>
          )}

          {formData.addSleepingBagRental && (
            <div className="flex justify-between text-stone-600">
              <span>Sleeping Bag Rental</span>
              <span className="font-semibold text-stone-900">
                ${formData.travelerCount * 60}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-stone-200 pt-3 text-sm font-bold text-stone-900">
            <span>Total Expedition Cost</span>
            <span>${totalUSD}</span>
          </div>
        </div>

        <div className="rounded-xl bg-stone-900 p-4 text-white">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">
            Deposit Due Today
          </span>
          <p className="text-2xl font-black">${depositUSD}</p>
          <span className="text-[10px] text-stone-400 block mt-1">
            Remaining balance payable upon briefing arrival in Kathmandu.
          </span>
        </div>
      </aside>
    </div>
  );
}
