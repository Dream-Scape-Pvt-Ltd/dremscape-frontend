import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Compass, Calendar, DollarSign, FileCheck, ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { destinationsApi } from "@/features/destinations/api/destinations";
import { treksApi } from "@/features/treks/api/treks";
import { TrekCard } from "@/features/treks/components/trek-card";
import { siteConfig } from "@/config/site";

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const destinations = await destinationsApi.list();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dest = await destinationsApi.getBySlug(slug);

  if (!dest) return { title: "Destination Not Found" };

  return {
    title: `${dest.name} Trekking & Expeditions | Dreamscape Treks`,
    description: dest.description,
    openGraph: {
      title: `${dest.name} Expeditions | Dreamscape Treks`,
      description: dest.description,
      images: [dest.heroImageUrl],
    },
  };
}

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = await destinationsApi.getBySlug(slug);

  if (!destination) {
    notFound();
  }

  // Filter treks for this destination
  const treksData = await treksApi.list({ destination: slug });

  const breadcrumbs = [
    { label: "Destinations", href: "/destinations" },
    { label: destination.name, active: true },
  ];

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      {/* Hero Header */}
      <header className="relative min-h-[420px] lg:h-[55vh] w-full overflow-hidden bg-stone-950">
        <Image
          src={destination.heroImageUrl}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end p-6 md:p-12 lg:p-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Himalayan Frontier
          </span>
          <h1 className="mt-2 text-4xl sm:text-6xl font-black font-serif text-white">
            {destination.name}
          </h1>
          <p className="mt-2 text-base text-stone-200 max-w-2xl">{destination.tagline}</p>
        </div>
      </header>

      {/* Breadcrumb Bar */}
      <div className="border-b border-stone-200 bg-white">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Overview & Treks */}
            <div className="lg:col-span-2 space-y-10">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold font-serif text-stone-900">
                  About Expeditions in {destination.name}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-600">
                  {destination.description}
                </p>
              </div>

              {/* Expeditions in Destination */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold font-serif text-stone-900">
                    Featured {destination.name} Treks
                  </h2>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/treks?destination=${destination.slug}`}>
                      View All in {destination.name} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {treksData.results.map((trek) => (
                    <TrekCard key={trek.id} trek={trek} />
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Essentials Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3">
                  Travel Essentials
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 block">Best Seasons</span>
                      <span className="text-stone-500">{destination.bestSeasons}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 block">Currency</span>
                      <span className="text-stone-500">{destination.currency}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 block">Visa & Permits</span>
                      <span className="text-stone-500">{destination.visaInfo}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                    <Link href={`/inquire?destination=${destination.name}`}>
                      Inquire for {destination.name}
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </div>
  );
}
