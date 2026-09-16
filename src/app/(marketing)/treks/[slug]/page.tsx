import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, X, Shield, Award, Calendar, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { treksApi } from "@/features/treks/api/treks";
import { TrekHero } from "@/features/treks/components/trek-hero";
import { TrekQuickFacts } from "@/features/treks/components/trek-quick-facts";
import { TrekStickyCTA } from "@/features/treks/components/trek-sticky-cta";
import { TrekJsonLd } from "@/features/treks/components/trek-json-ld";
import { ElevationProfile } from "@/components/maps/elevation-profile";
import { InteractiveMap } from "@/components/maps/interactive-map";
import { ItineraryAccordion } from "@/features/itineraries/components/itinerary-accordion";

interface TrekPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400; // 24-hour ISR revalidation

export async function generateStaticParams() {
  const slugs = await treksApi.getAllSlugs();
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: TrekPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trek = await treksApi.getBySlug(slug);

  if (!trek) return { title: "Trek Not Found | Dreamscape Treks" };

  const canonicalUrl = `${siteConfig.url}/treks/${trek.slug}`;

  return {
    title: `${trek.title} (${trek.durationDays} Days) - Dreamscape Treks`,
    description: trek.metaDescription || trek.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${trek.title} | Himalayan Expedition`,
      description: trek.summary,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: trek.heroImage.url,
          width: 1200,
          height: 630,
          alt: `${trek.title} Himalayan Vista`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: trek.title,
      description: trek.summary,
      images: [trek.heroImage.url],
    },
  };
}

export default async function TrekDetailPage({ params }: TrekPageProps) {
  const { slug } = await params;
  const trek = await treksApi.getBySlug(slug);

  if (!trek) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Treks", href: "/treks" },
    { label: trek.region.name, href: `/regions/${trek.region.slug}` },
    { label: trek.title, active: true },
  ];

  return (
    <>
      <TrekJsonLd trek={trek} />

      <article className="min-h-screen bg-stone-50 pb-20">
        {/* Full-width Panoramic Hero */}
        <TrekHero trek={trek} />

        {/* Breadcrumbs Ribbon */}
        <div className="border-b border-stone-200 bg-white">
          <Container>
            <Breadcrumbs items={breadcrumbs} />
          </Container>
        </div>

        {/* Content Layout Grid */}
        <Container className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Facts Grid */}
              <TrekQuickFacts trek={trek} />

              {/* Overview */}
              <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold font-serif text-stone-900">Expedition Overview</h2>
                <div
                  className="prose prose-stone mt-4 text-xs sm:text-sm leading-relaxed text-stone-600"
                  dangerouslySetInnerHTML={{ __html: trek.overviewHtml }}
                />

                {/* Highlights list */}
                {trek.highlights && trek.highlights.length > 0 && (
                  <div className="mt-6 border-t border-stone-100 pt-6">
                    <h3 className="text-sm font-bold text-stone-900">Expedition Highlights</h3>
                    <ul className="mt-3 space-y-2 text-xs text-stone-600">
                      {trek.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Elevation Profile Chart */}
              {trek.elevationPoints && trek.elevationPoints.length > 0 && (
                <section>
                  <ElevationProfile points={trek.elevationPoints} />
                </section>
              )}

              {/* Interactive Map & Waypoints */}
              <section>
                <InteractiveMap
                  regionName={trek.region.name}
                  waypoints={trek.elevationPoints.map((ep) => ({
                    latitude: 27.988 + ep.distanceKm * 0.005,
                    longitude: 86.925 + ep.distanceKm * 0.004,
                    name: ep.waypointName,
                    altitudeMeters: ep.elevationMeters,
                  }))}
                />
              </section>

              {/* Detailed Itinerary Accordion */}
              <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-stone-900">
                      Day-by-Day Itinerary
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {trek.durationDays} Days Expedition with certified acclimatization milestones
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    {trek.itinerary.length} Briefing Days
                  </span>
                </div>

                <ItineraryAccordion days={trek.itinerary} />
              </section>

              {/* Inclusions & Exclusions */}
              <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold font-serif text-stone-900 mb-6">
                  Logistics: What&apos;s Included
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                  {/* Inclusions */}
                  <div>
                    <h3 className="font-bold text-emerald-700 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Included in Cost
                    </h3>
                    <ul className="space-y-2 text-stone-600">
                      {trek.inclusions.length > 0 ? (
                        trek.inclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li>All national park permits, guide fees, domestic flights & lodges.</li>
                      )}
                    </ul>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <h3 className="font-bold text-rose-700 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                      <X className="h-4 w-4" /> Not Included
                    </h3>
                    <ul className="space-y-2 text-stone-600">
                      {trek.exclusions.length > 0 ? (
                        trek.exclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li>International airfare, travel insurance, personal equipment & tips.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Desktop Sticky Booking Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
                  <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                    <div>
                      <span className="text-xs uppercase font-bold text-stone-400 block">From</span>
                      <p className="text-3xl font-black text-stone-950">${trek.priceFromUSD}</p>
                    </div>
                    <span className="text-xs text-stone-500">per person (twin share)</span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12 text-sm shadow">
                      <Link href={`/booking/${trek.slug}`}>
                        Book This Trek <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-stone-800">
                      <Link href={`/inquire?trek=${trek.slug}`}>Customize Private Trip</Link>
                    </Button>
                  </div>

                  {/* Trust guarantees */}
                  <div className="mt-6 border-t border-stone-100 pt-4 space-y-2.5 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Free date rescheduling up to 30 days prior</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Guaranteed small groups (max 10 trekkers)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>100% Guaranteed departures once booked</span>
                    </div>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white text-xs">
                  <h4 className="font-bold text-sm font-serif">Have questions before booking?</h4>
                  <p className="mt-2 text-stone-400 leading-relaxed">
                    Our Kathmandu expedition leaders are available via WhatsApp or email to answer
                    fitness, gear, or flight questions.
                  </p>
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="mt-4 inline-block font-bold text-emerald-400 hover:underline"
                  >
                    Call HQ: {siteConfig.contact.phone}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </Container>

        {/* Mobile Sticky CTA Trigger */}
        <TrekStickyCTA
          trekSlug={trek.slug}
          priceUSD={trek.priceFromUSD}
          durationDays={trek.durationDays}
        />
      </article>
    </>
  );
}
