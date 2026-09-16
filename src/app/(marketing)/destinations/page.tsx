import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { destinationsApi } from "@/features/destinations/api/destinations";
import { DestinationCard } from "@/features/destinations/components/destination-card";

export const metadata: Metadata = {
  title: "Himalayan Destinations | Nepal, Tibet, Bhutan, India",
  description:
    "Explore the sacred peaks and valleys across Nepal, Tibet, Bhutan, and the Indian Himalayas. Discover cultural circuits, high altitude sanctuaries, and permits.",
};

export default async function DestinationsPage() {
  const destinations = await destinationsApi.list();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Destinations", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Himalayan Destinations
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Four ancient frontiers connected by the greatest mountain range on Earth. Choose your
            gateway to high-altitude discovery.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
