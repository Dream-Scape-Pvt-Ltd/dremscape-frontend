import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { CustomTripForm } from "@/features/inquiries/components/custom-trip-form";

export const metadata: Metadata = {
  title: "Plan a Tailor-Made Himalayan Trek | Dreamscape Treks",
  description:
    "Design a bespoke private trekking itinerary in Nepal, Tibet, Bhutan, or India. Tell us your preferences and get a custom quote within 24 hours.",
};

interface InquirePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InquirePage({ searchParams }: InquirePageProps) {
  const resolved = await searchParams;
  const trek = typeof resolved.trek === "string" ? resolved.trek : undefined;

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Tailor-Made Inquiry", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Design Your Custom Expedition
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Let us craft a private trekking experience tailored precisely to your schedule, fitness
            level, and bucket list peaks.
          </p>
        </Container>
      </div>

      <Section>
        <Container className="max-w-3xl">
          <CustomTripForm defaultTrek={trek} />
        </Container>
      </Section>
    </div>
  );
}
