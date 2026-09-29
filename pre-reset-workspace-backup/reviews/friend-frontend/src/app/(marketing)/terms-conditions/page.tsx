import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Terms & Conditions & Evacuation Protocol | Dreamscape Treks",
  description:
    "Expedition booking conditions, cancellation refund policies, and high-altitude helicopter rescue guidelines.",
};

export default function TermsConditionsPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Terms & Conditions", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-stone-300">
            Booking contract and high-altitude safety guidelines
          </p>
        </Container>
      </div>

      <Section>
        <Container className="max-w-4xl">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 space-y-6 text-sm leading-relaxed text-stone-700">
            <h2 className="text-xl font-bold text-stone-900">1. Booking Deposit & Payments</h2>
            <p>
              A deposit of $400 USD per person is required to confirm any trekking expedition. This
              allows us to issue non-refundable restricted permits and reserve domestic flights to
              mountain airstrips such as Lukla or Jomsom. The remaining balance is payable upon
              arrival in Kathmandu prior to trek departure.
            </p>

            <h2 className="text-xl font-bold text-stone-900">2. Cancellation & Postponement</h2>
            <p>
              Cancellations made 30 days or more before the departure date receive a full refund minus
              permit administrative fees. Rescheduling to a future season is free of charge with at
              least 30 days notice.
            </p>

            <h2 id="safety" className="text-xl font-bold text-stone-900">
              3. Mandatory Travel & Helicopter Evacuation Insurance
            </h2>
            <p>
              All clients must possess comprehensive travel insurance that explicitly covers
              emergency helicopter medical evacuation up to 6,000 meters above sea level. Proof of
              valid policy is verified during our Kathmandu pre-trip briefing.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
