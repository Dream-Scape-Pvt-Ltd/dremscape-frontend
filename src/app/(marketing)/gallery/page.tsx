import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { PhotoGrid } from "@/features/gallery";

export const metadata: Metadata = {
  title: "Himalayan Photography Gallery | Dreamscape Treks",
  description:
    "High-resolution mountain photography from Everest, Ama Dablam, Gokyo Ri, Annapurna, and Upper Mustang.",
};

export default function GalleryPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Gallery", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Himalayan Visual Expedition
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            A curated photographic collection of high-altitude passes, ancient Buddhist monasteries,
            turquoise glacial lakes, and towering 8,000m summits.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <PhotoGrid />
        </Container>
      </Section>
    </div>
  );
}
