import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { treksApi } from "@/features/treks/api/treks";
import { TrekCard } from "@/features/treks/components/trek-card";
import { TrekFilterDrawer } from "@/features/treks/components/trek-filter-drawer";
import { EmptyState } from "@/components/feedback/empty-state";
import type { TrekDifficulty } from "@/features/treks/types";

export const metadata: Metadata = {
  title: "All Himalayan Treks & Expeditions | Nepal, Tibet, Bhutan, India",
  description:
    "Explore our complete catalog of certified guided trekking expeditions in Nepal, Tibet, Bhutan, and the Indian Himalayas. Filter by region, difficulty grade, and altitude.",
};

interface TreksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TreksDirectoryPage({ searchParams }: TreksPageProps) {
  const resolvedParams = await searchParams;
  const region = typeof resolvedParams.region === "string" ? resolvedParams.region : undefined;
  const difficulty = typeof resolvedParams.difficulty === "string" ? (resolvedParams.difficulty as TrekDifficulty) : undefined;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;

  const treksData = await treksApi.list({ region, difficulty, search });

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header Banner */}
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Expeditions & Treks", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Himalayan Treks & Expeditions
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Filter our certified expeditions across Everest, Annapurna, Manaslu, Mustang, Dolpo,
            and beyond. Every trek is led by local Sherpa mountaineers with full logistical support.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Filter Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28">
                <TrekFilterDrawer />
              </div>
            </aside>

            {/* Trek Grid */}
            <main className="lg:col-span-3">
              <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-6">
                <p className="text-xs font-bold text-stone-600">
                  Showing <span className="text-stone-900 font-extrabold">{treksData.count}</span> expeditions
                </p>
              </div>

              {treksData.results.length === 0 ? (
                <EmptyState
                  title="No expeditions match your filters"
                  description="Try clearing your difficulty or region filters to view all available Himalayan circuits."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {treksData.results.map((trek) => (
                    <TrekCard key={trek.id} trek={trek} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </Container>
      </Section>
    </div>
  );
}
