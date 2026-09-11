import type { TrekDetail } from "../types";
import { siteConfig } from "@/config/site";

export function TrekJsonLd({ trek }: { trek: TrekDetail }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trek.title,
    description: trek.summary,
    touristType: ["Hikers", "Mountaineers", "Adventure Travelers"],
    offers: {
      "@type": "Offer",
      price: trek.priceFromUSD,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/treks/${trek.slug}`,
    },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: trek.itinerary.length,
      itemListElement: trek.itinerary.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristAttraction",
          name: `Day ${day.dayNumber}: ${day.title}`,
          description: day.description,
          elevation: `${day.elevationMeters} meters`,
        },
      })),
    },
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: siteConfig.contact.phone,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
