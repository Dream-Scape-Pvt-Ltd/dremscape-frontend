import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { BlogPost } from "../types";

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "p1",
    slug: "acclimatization-guide-high-altitude",
    title: "High Altitude Acclimatization & AMS Prevention Protocol in the Himalayas",
    excerpt:
      "A medical and guide-tested strategy for ascending safely beyond 5,000m: hydration metrics, Diamox usage guidelines, and recognizing Acute Mountain Sickness symptoms.",
    contentHtml:
      "<p>Ascending into the rarefied air of the Khumbu or Annapurna sanctuaries requires respect for barometric atmospheric pressure drops. Beyond 3,000 meters, atmospheric pressure and effective oxygen availability are reduced significantly.</p><h2>The Golden Rules of Himalayan Ascent</h2><p>1. Climb High, Sleep Low: Always take afternoon acclimatization day hikes before sleeping at your campsite.</p><p>2. Hydration: Maintain a minimum fluid intake of 3.5 to 4 liters daily consisting of water, electrolytes, and ginger lemon tea.</p>",
    category: "Altitude & Health",
    author: { name: "Dr. Sangay Sherpa", title: "Himalayan Rescue Medical Advisor" },
    publishedAt: "2026-02-18",
    readingTimeMinutes: 8,
    coverImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p2",
    slug: "ultimate-himalayan-packing-list",
    title: "The Ultimate Four-Season Himalayan Trekking Gear Checklist",
    excerpt:
      "From -20°C sleeping bag ratings to waterproof boots and merino wool layering systems: the definitive gear breakdown for tea house and pass crossings.",
    contentHtml:
      "<p>Packing for a multi-week expedition in Nepal requires balancing warmth, weight, and weather resistance. Porters are legally limited to carrying 20-25 kg for two clients, making weight mindfulness essential.</p>",
    category: "Gear Guide",
    author: { name: "Dawa Nuru Sherpa", title: "Senior Expedition Lead" },
    publishedAt: "2026-01-25",
    readingTimeMinutes: 10,
    coverImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  },
];

export const blogApi = {
  async list(): Promise<BlogPost[]> {
    try {
      return await apiClient.get<BlogPost[]>(API_ENDPOINTS.blog.list, {
        tags: ["blog-list"],
        revalidate: 86400,
      });
    } catch {
      return MOCK_POSTS;
    }
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      return await apiClient.get<BlogPost>(API_ENDPOINTS.blog.detail(slug), {
        tags: [`blog-${slug}`],
        revalidate: 86400,
      });
    } catch {
      return MOCK_POSTS.find((p) => p.slug === slug) || null;
    }
  },
};
