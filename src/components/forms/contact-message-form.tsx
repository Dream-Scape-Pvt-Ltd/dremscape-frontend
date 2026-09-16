"use client";

import * as React from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormLabel } from "./form-field";

export function ContactMessageForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
        <h4 className="text-base font-bold text-stone-900">Message Dispatched</h4>
        <p className="text-xs text-stone-600 mt-1">
          Thank you! Our expedition desk will review your message and reply within 12 hours.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <FormLabel required>Your Name</FormLabel>
          <Input placeholder="John Doe" required />
        </FormField>
        <FormField>
          <FormLabel required>Email Address</FormLabel>
          <Input type="email" placeholder="john@example.com" required />
        </FormField>
      </div>

      <FormField>
        <FormLabel required>Subject</FormLabel>
        <Input placeholder="Inquiry about Everest Base Camp dates or gear" required />
      </FormField>

      <FormField>
        <FormLabel required>Message</FormLabel>
        <Textarea placeholder="How can our Sherpa team help you?" rows={4} required />
      </FormField>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
      >
        <Send className="mr-2 h-4 w-4" /> Send Message
      </Button>
    </form>
  );
}
