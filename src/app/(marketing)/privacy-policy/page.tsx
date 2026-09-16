import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy | Dreamscape Treks",
  description: "Privacy policy and traveler data protection standards of Dreamscape Treks & Expeditions.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Privacy Policy", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">Privacy Policy</h1>
          <p className="mt-2 text-sm text-stone-300">Last updated: March 2026</p>
        </Container>
      </div>

      <Section>
        <Container className="max-w-4xl">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 space-y-6 text-sm leading-relaxed text-stone-700">
            <h2 className="text-xl font-bold text-stone-900">1. Information Collection</h2>
            <p>
              We collect necessary identification data including passport scans, legal names, dates of
              birth, and nationalities strictly to process national park permits, restricted area
              clearances, domestic flight tickets, and emergency rescue registrations with the Nepal
              Tourism Board.
            </p>

            <h2 className="text-xl font-bold text-stone-900">2. Medical Information</h2>
            <p>
              High-altitude health declarations and emergency contact details are shared only with our
              licensed lead guides and Himalayan medical evacuation partners in the event of Acute
              Mountain Sickness (AMS) or trauma evacuation.
            </p>

            <h2 className="text-xl font-bold text-stone-900">3. Data Security</h2>
            <p>
              We implement industry-standard encryption and never sell or rent your personal
              information to third-party commercial brokers.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
