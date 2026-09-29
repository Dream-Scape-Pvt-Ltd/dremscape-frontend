import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { DestinationSummary } from "../types";

export const MOCK_DESTINATIONS: DestinationSummary[] = [
  {
    id: "dest-1",
    slug: "nepal",
    name: "Nepal",
    tagline: "The Pinnacle of High Himalayan Expeditions",
    heroImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    trekCount: 24,
    bestSeasons: "March - May & September - November",
    capital: "Kathmandu",
    currency: "Nepalese Rupee (NPR)",
    visaInfo: "Visa on Arrival available at Tribhuvan International Airport (TIA)",
    description:
      "Home to eight of the world's fourteen 8,000-meter peaks, including Mount Everest, Kanchenjunga, and Annapurna. Unsurpassed teahouse trekking culture and hospitable Sherpa communities.",
  },
  {
    id: "dest-2",
    slug: "tibet",
    name: "Tibet",
    tagline: "Roof of the World & Sacred Pilgrimages",
    heroImageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
    trekCount: 6,
    bestSeasons: "May - October",
    capital: "Lhasa",
    currency: "Chinese Yuan (CNY)",
    visaInfo: "Tibet Travel Permit (TTP) arranged by Dreamscape in advance",
    description:
      "An otherworldly high-altitude plateau of turquoise alpine lakes, monastery fortresses, the Potala Palace, and the sacred Mount Kailash circuit.",
  },
  {
    id: "dest-3",
    slug: "bhutan",
    name: "Bhutan",
    tagline: "The Thunder Dragon Kingdom of Gross National Happiness",
    heroImageUrl: "https://images.unsplash.com/photo-1585409677983-0f6c41ca0c33?auto=format&fit=crop&w=800&q=80",
    trekCount: 5,
    bestSeasons: "March - May & September - November",
    capital: "Thimphu",
    currency: "Bhutanese Ngultrum (BTN)",
    visaInfo: "Pre-approved e-visa included with Bhutan Sustainable Development Fee (SDF)",
    description:
      "A pristine kingdom cloaked in pine forests, cliffside dzongs, the legendary Tiger's Nest (Paro Taktsang), and the untamed high alpine Snowman Trek.",
  },
  {
    id: "dest-4",
    slug: "india",
    name: "Indian Himalayas",
    tagline: "From Frozen Zanskar Rivers to Kanchenjunga Ridges",
    heroImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    trekCount: 8,
    bestSeasons: "January - February (Chadar) & June - September (Ladakh)",
    capital: "New Delhi (Ladakh / Sikkim / Himachal)",
    currency: "Indian Rupee (INR)",
    visaInfo: "Indian Tourist e-Visa required prior to arrival",
    description:
      "The dramatic high-altitude desert moonscapes of Ladakh, the frozen Chadar river trek, and the green alpine rhododendron ridges of Sikkim and Garhwal.",
  },
];

export const destinationsApi = {
  async list(): Promise<DestinationSummary[]> {
    try {
      return await apiClient.get<DestinationSummary[]>(API_ENDPOINTS.destinations.list, {
        tags: ["destinations-list"],
        revalidate: 86400,
      });
    } catch {
      return MOCK_DESTINATIONS;
    }
  },

  async getBySlug(slug: string): Promise<DestinationSummary | null> {
    try {
      return await apiClient.get<DestinationSummary>(API_ENDPOINTS.destinations.detail(slug), {
        tags: [`destination-${slug}`],
        revalidate: 86400,
      });
    } catch {
      return MOCK_DESTINATIONS.find((d) => d.slug === slug) || null;
    }
  },
};
