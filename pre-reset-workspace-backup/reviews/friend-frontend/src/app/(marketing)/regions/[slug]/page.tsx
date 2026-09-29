import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { treksApi } from "@/features/treks/api/treks";
import { TrekCard } from "@/features/treks/components/trek-card";
import { EmptyState } from "@/components/feedback/empty-state";

interface RegionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${capitalized} Region Treks & Expeditions | Dreamscape Treks`,
    description: `Discover all high-altitude guided trekking expeditions in the ${capitalized} region of Nepal.`,
  };
}

export default async function RegionDetailPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  const treksData = await treksApi.list({ region: slug });

  const breadcrumbs = [
    { label: "Regions", href: "/regions" },
    { label: `${capitalized} Region`, active: true },
  ];

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            {capitalized} Region Expeditions
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Certified guided mountain routes, teahouse circuits, and restricted wilderness permits in
            the {capitalized} Himalayas.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          {treksData.results.length === 0 ? (
            <EmptyState
              title={`No expeditions found in ${capitalized} region`}
              description="Our expedition operators are currently preparing custom routes for this area."
              actionLabel="Explore All Treks"
              onAction={() => {}}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {treksData.results.map((trek) => (
                <TrekCard key={trek.id} trek={trek} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
