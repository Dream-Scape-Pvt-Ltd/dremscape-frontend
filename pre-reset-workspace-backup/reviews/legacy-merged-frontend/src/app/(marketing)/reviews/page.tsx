import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { reviewsApi } from "@/features/reviews/api/reviews";
import { ReviewCard } from "@/features/reviews/components/review-card";

export const metadata: Metadata = {
  title: "Verified Traveler Reviews & Testimonials | Dreamscape Treks",
  description:
    "Read 500+ unedited verified reviews from adventurers who completed Everest Base Camp, Annapurna Circuit, and Manaslu with our Sherpa guide teams.",
};

export default async function ReviewsPage() {
  const reviews = await reviewsApi.list();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Reviews & Testimonials", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Verified Traveler Reviews
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Real feedback from mountain travelers across the globe who trusted Dreamscape Treks with
            their high Himalayan expeditions.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-8 text-center max-w-xl mx-auto shadow-sm">
            <span className="text-4xl font-black text-stone-950 font-serif">4.96</span>
            <div className="flex justify-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-500 font-semibold">
              Based on 500+ verified expedition departures in Nepal, Tibet & Bhutan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
