import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { treksApi } from "@/features/treks/api/treks";
import { BookingWizard } from "@/features/bookings/components/booking-wizard";

interface BookingPageProps {
  params: Promise<{ trekSlug: string }>;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { trekSlug } = await params;
  const trek = await treksApi.getBySlug(trekSlug);

  if (!trek) return { title: "Booking | Dreamscape Treks" };

  return {
    title: `Book ${trek.title} | Dreamscape Treks Secure Checkout`,
    description: `Complete your reservation and deposit for ${trek.title} (${trek.durationDays} Days).`,
    robots: { index: false, follow: false },
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { trekSlug } = await params;
  const trek = await treksApi.getBySlug(trekSlug);

  if (!trek) {
    notFound();
  }

  return (
    <Container className="max-w-5xl">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Step-by-Step Expedition Reservation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900 mt-1">
          {trek.title}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {trek.durationDays} Days Expedition • {trek.region.name} • Certified Sherpa Guides
        </p>
      </div>

      <BookingWizard trekSlug={trek.slug} pricePerPersonUSD={trek.priceFromUSD} />
    </Container>
  );
}
