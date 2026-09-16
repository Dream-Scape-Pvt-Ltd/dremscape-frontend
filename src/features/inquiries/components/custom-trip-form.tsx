"use client";

import * as React from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormLabel, FormMessage } from "@/components/forms/form-field";
import { inquiriesApi } from "../api/inquiries";
import { inquirySchema, type InquiryInput } from "../schemas";

export function CustomTripForm({ defaultTrek }: { defaultTrek?: string }) {
  const [formData, setFormData] = React.useState<InquiryInput>({
    name: "",
    email: "",
    phone: "",
    destination: "Nepal",
    regionInterest: defaultTrek || "Everest / Khumbu",
    travelerCount: 2,
    estimatedMonthYear: "October 2026",
    estimatedDurationDays: 14,
    fitnessLevel: "moderate",
    customNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = inquirySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    await inquiriesApi.submit(result.data);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
        <h3 className="text-xl font-bold text-stone-900">Inquiry Received!</h3>
        <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">
          Dhanyabad! Our Kathmandu expedition operations team has received your tailor-made request
          and will draft a custom day-by-day itinerary and quote within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="border-b border-stone-100 pb-4">
        <h3 className="text-xl font-bold text-stone-900">Tailor-Made Himalayan Expedition Planner</h3>
        <p className="mt-1 text-xs text-stone-500">
          Tell us your ideal destinations, trekking duration, and dates. We craft bespoke custom
          itineraries with private Sherpa guides.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <FormLabel required>Full Name</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sarah Connor"
          />
          <FormMessage>{errors.name}</FormMessage>
        </FormField>

        <FormField>
          <FormLabel required>Email Address</FormLabel>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="sarah@example.com"
          />
          <FormMessage>{errors.email}</FormMessage>
        </FormField>

        <FormField>
          <FormLabel required>Phone Number (WhatsApp)</FormLabel>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 234-5678"
          />
          <FormMessage>{errors.phone}</FormMessage>
        </FormField>

        <FormField>
          <FormLabel required>Destination</FormLabel>
          <select
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Nepal">Nepal (Everest, Annapurna, Manaslu)</option>
            <option value="Tibet">Tibet (Kailash, Lhasa, Everest North)</option>
            <option value="Bhutan">Bhutan (Druk Path, Snowman, Paro)</option>
            <option value="India">Indian Himalayas (Ladakh, Sikkim)</option>
          </select>
        </FormField>

        <FormField>
          <FormLabel>Target Month & Year</FormLabel>
          <Input
            value={formData.estimatedMonthYear}
            onChange={(e) => setFormData({ ...formData, estimatedMonthYear: e.target.value })}
            placeholder="e.g. October 2026"
          />
        </FormField>

        <FormField>
          <FormLabel>Approximate Duration (Days)</FormLabel>
          <Input
            type="number"
            value={formData.estimatedDurationDays}
            onChange={(e) =>
              setFormData({ ...formData, estimatedDurationDays: Number(e.target.value) })
            }
          />
        </FormField>
      </div>

      <FormField>
        <FormLabel>Specific Route Preferences / Custom Requests</FormLabel>
        <Textarea
          value={formData.customNotes}
          onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
          placeholder="Tell us about your mountaineering experience, helicopter return preferences, private group size, or dietary needs..."
          rows={4}
        />
      </FormField>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
      >
        <Send className="mr-2 h-4 w-4" /> Request Custom Expedition Proposal
      </Button>
    </form>
  );
}
