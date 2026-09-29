import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { blogApi } from "@/features/blog/api/blog";
import { ArticleCard } from "@/features/blog/components/article-card";

export const metadata: Metadata = {
  title: "Himalayan Travel Guides, Gear Advice & Trail Reports | Dreamscape",
  description:
    "Expert articles on high altitude acclimatization, Diamox guidelines, four-season gear packing checklists, and local Sherpa cultural traditions.",
};

export default async function BlogIndexPage() {
  const posts = await blogApi.list();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Travel Guides & Blog", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Himalayan Guides & Expedition Dispatches
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Practical advice written by mountain guides and medical advisors: altitude health, gear
            layering systems, and trail condition reports.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
