import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { treksApi } from "@/features/treks/api/treks";
import { TrekCard } from "@/features/treks/components/trek-card";

interface ActivityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").toUpperCase();
  return {
    title: `${name} Trips & Expeditions | Dreamscape Treks`,
    description: `Browse all high-altitude trips and certified guides for ${name}.`,
  };
}

export default async function ActivityDetailPage({ params }: ActivityPageProps) {
  const { slug } = await params;
  const displayName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const treksData = await treksApi.list();

  const breadcrumbs = [
    { label: "Activities", href: "/activities" },
    { label: displayName, active: true },
  ];

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">{displayName}</h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Experience the Himalayas through our specialized {displayName.toLowerCase()} itineraries
            led by veteran mountaineers.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {treksData.results.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
