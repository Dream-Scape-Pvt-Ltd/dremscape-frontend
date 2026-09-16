import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SearchBar } from "@/features/search/components/search-bar";
import { searchApi } from "@/features/search/api/search";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Expeditions & Guides | Dreamscape Treks",
  description: "Search across all Himalayan treks, regions, destinations, and travel guide articles.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const q = typeof resolved.q === "string" ? resolved.q : "";
  const results = q ? await searchApi.query(q) : [];

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Search", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Search Expeditions & Routes
          </h1>
          <div className="mt-6 max-w-xl">
            <SearchBar />
          </div>
        </Container>
      </div>

      <Section>
        <Container>
          {q && (
            <p className="text-xs font-bold text-stone-600 mb-6">
              Found <span className="text-stone-900 font-extrabold">{results.length}</span> results
              for &ldquo;{q}&rdquo;
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res) => (
              <Link
                key={res.id}
                href={res.url}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Compass className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    {res.type}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{res.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
