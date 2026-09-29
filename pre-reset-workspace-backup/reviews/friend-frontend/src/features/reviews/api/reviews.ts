import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ReviewItem } from "../types";

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    authorName: "Alexander Vance",
    authorCountry: "United Kingdom",
    trekTitle: "Everest Base Camp & Gokyo Lakes",
    rating: 5,
    date: "2025-11-14",
    content:
      "Crossing the Cho La Pass with our lead guide Dawa Sherpa was the crowning achievement of my outdoor life. The team's attention to daily oxygen checks, acclimatization, and warm tea in the morning made all the difference at 5,400m.",
    guideName: "Dawa Nuru Sherpa",
    verified: true,
  },
  {
    id: "r2",
    authorName: "Helena Lindqvist",
    authorCountry: "Sweden",
    trekTitle: "Manaslu Circuit Remote Sanctuary Trek",
    rating: 5,
    date: "2025-10-28",
    content:
      "If you want wild Himalayas without the commercial tourist crowds, Manaslu is pure magic. Dreamscape arranged our restricted area permits flawlessly and our porters were treated like family.",
    guideName: "Pasang Tenzing",
    verified: true,
  },
  {
    id: "r3",
    authorName: "Marcus & Diane Davis",
    authorCountry: "Australia",
    trekTitle: "Upper Mustang Forbidden Kingdom",
    rating: 5,
    date: "2025-08-19",
    content:
      "Trekking Mustang during August was completely dry thanks to the Himalayan rainshadow. The ancient Tibetan walled city of Lo Manthang and the cliff caves exceeded every expectation.",
    guideName: "Pemba Gelje",
    verified: true,
  },
];

export const reviewsApi = {
  async list(): Promise<ReviewItem[]> {
    try {
      return await apiClient.get<ReviewItem[]>(API_ENDPOINTS.reviews.list, {
        tags: ["reviews-list"],
        revalidate: 3600,
      });
    } catch {
      return MOCK_REVIEWS;
    }
  },
};
