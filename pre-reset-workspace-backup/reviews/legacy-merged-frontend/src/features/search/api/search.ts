import { MOCK_TREKS } from "@/features/treks/api/treks";
import { MOCK_DESTINATIONS } from "@/features/destinations/api/destinations";
import type { SearchResultItem } from "../types";

export const searchApi = {
  async query(term: string): Promise<SearchResultItem[]> {
    if (!term || term.trim().length < 2) return [];

    const q = term.toLowerCase();
    const results: SearchResultItem[] = [];

    // Search Treks
    MOCK_TREKS.forEach((trek) => {
      if (
        trek.title.toLowerCase().includes(q) ||
        trek.region.name.toLowerCase().includes(q) ||
        trek.summary.toLowerCase().includes(q)
      ) {
        results.push({
          id: `trek-${trek.id}`,
          type: "trek",
          title: trek.title,
          subtitle: `${trek.region.name} • ${trek.durationDays} Days • $${trek.priceFromUSD}`,
          url: `/treks/${trek.slug}`,
          imageUrl: trek.featuredImageUrl,
        });
      }
    });

    // Search Destinations
    MOCK_DESTINATIONS.forEach((dest) => {
      if (dest.name.toLowerCase().includes(q) || dest.description.toLowerCase().includes(q)) {
        results.push({
          id: `dest-${dest.id}`,
          type: "destination",
          title: dest.name,
          subtitle: `${dest.trekCount} Expeditions • ${dest.tagline}`,
          url: `/destinations/${dest.slug}`,
          imageUrl: dest.heroImageUrl,
        });
      }
    });

    return results;
  },
};
