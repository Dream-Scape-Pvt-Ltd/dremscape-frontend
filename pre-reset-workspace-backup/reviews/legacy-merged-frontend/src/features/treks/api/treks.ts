import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/api";
import type { TrekDetail, TrekSummary, TrekFilters } from "../types";

// Production mock catalog for Nepal & Beyond (Everest, Annapurna, Manaslu, Mustang, etc.)
export const MOCK_TREKS: TrekDetail[] = [
  {
    id: "1",
    slug: "everest-base-camp-gokyo",
    title: "Everest Base Camp & Gokyo Lakes via Cho La Pass",
    region: { id: "reg-1", name: "Everest / Khumbu", slug: "everest" },
    destination: { id: "dest-1", name: "Nepal", slug: "nepal" },
    difficulty: "strenuous",
    durationDays: 16,
    maxAltitudeMeters: 5545,
    priceFromUSD: 2150,
    featuredImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    summary:
      "The definitive Khumbu grand circuit combining the iconic Everest Base Camp, dramatic turquoise Gokyo Lakes, and the thrilling crossing of Cho La Pass (5,420m).",
    ratingAverage: 4.95,
    reviewCount: 142,
    bestSeasons: ["spring", "autumn"],
    metaDescription:
      "Book the Everest Base Camp & Gokyo Lakes trek with certified Sherpa guides. 16 days through Cho La Pass, Kala Patthar, and turquoise glacial lakes.",
    heroImage: {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
      alt: "Everest Base Camp mountain vista",
    },
    galleryImages: [
      { id: "g1", url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80", caption: "Gokyo Ri View" },
      { id: "g2", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", caption: "Himalayan Sunrise" },
    ],
    overviewHtml:
      "<p>Embark on one of the greatest alpine adventures on Earth. The Everest Base Camp and Gokyo Lakes Circuit ascends through legendary Sherpa villages, ancient monasteries, and glacial moraines under the shadow of Nuptse, Lhotse, and Ama Dablam.</p><p>Cross the glaciated 5,420m Cho La Pass and summit Kala Patthar (5,545m) for unimpeded 360-degree panoramas of Mount Everest's south face.</p>",
    highlights: [
      "Stand at the foot of Mount Everest (8,848.86m) at iconic Everest Base Camp",
      "Summit Kala Patthar (5,545m) for sunrise over the Khumbu Icefall",
      "Cross the rugged, glaciated Cho La Pass (5,420m)",
      "Marvel at the sacred turquoise waters of the Gokyo Sacred Lakes",
      "Immerse in Sherpa Buddhist culture at Tengboche and Khumjung monasteries",
    ],
    permitTypesRequired: [
      "Sagarmatha National Park Permit",
      "Khumbu Pasang Lhamu Rural Municipality Entry Permit",
    ],
    itinerary: [
      {
        id: "d1",
        dayNumber: 1,
        title: "Fly Kathmandu to Lukla (2,840m) & Trek to Phakding (2,610m)",
        description: "Scenic mountain flight into Lukla airstrip followed by an easy descent along the Dudh Koshi river.",
        startPoint: "Kathmandu",
        endPoint: "Phakding",
        elevationMeters: 2610,
        walkingHours: 4,
        accommodation: "Teahouse Lodge",
        mealsProvided: ["lunch", "dinner"],
      },
      {
        id: "d2",
        dayNumber: 2,
        title: "Trek to Namche Bazaar (3,440m)",
        description: "Enter Sagarmatha National Park at Monjo and cross the soaring Hillary Suspension Bridge before ascending to the Sherpa capital.",
        startPoint: "Phakding",
        endPoint: "Namche Bazaar",
        elevationMeters: 3440,
        walkingHours: 6,
        accommodation: "Mountain Lodge",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d3",
        dayNumber: 3,
        title: "Acclimatization Day in Namche Bazaar (3,440m)",
        description: "Hike to Everest View Hotel for first vistas of Ama Dablam, Lhotse, and Everest, and explore the Sherpa Culture Museum.",
        startPoint: "Namche Bazaar",
        endPoint: "Namche Bazaar",
        elevationMeters: 3880,
        walkingHours: 4,
        accommodation: "Mountain Lodge",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d4",
        dayNumber: 4,
        title: "Trek to Tengboche (3,860m)",
        description: "Walk past prayer wheels and pine forests down to Phunki Tenga, followed by a steep climb to the spiritual heart of the Khumbu.",
        startPoint: "Namche Bazaar",
        endPoint: "Tengboche",
        elevationMeters: 3860,
        walkingHours: 5,
        accommodation: "Teahouse Lodge",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d5",
        dayNumber: 5,
        title: "Trek to Dingboche (4,410m)",
        description: "Pass stone walls and birch groves into alpine tundra with views of Ama Dablam towering right overhead.",
        startPoint: "Tengboche",
        endPoint: "Dingboche",
        elevationMeters: 4410,
        walkingHours: 5.5,
        accommodation: "Alpine Teahouse",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d6",
        dayNumber: 6,
        title: "Acclimatization Hike to Nagarjun Hill (5,100m)",
        description: "High altitude conditioning trek providing sweeping panoramas of Makalu, Lhotse, and Island Peak.",
        startPoint: "Dingboche",
        endPoint: "Dingboche",
        elevationMeters: 5100,
        walkingHours: 4.5,
        accommodation: "Alpine Teahouse",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d7",
        dayNumber: 7,
        title: "Trek to Lobuche (4,940m)",
        description: "Climb through Thokla Pass memorial ridge honoring fallen climbers and follow the lateral moraine of the Khumbu Glacier.",
        startPoint: "Dingboche",
        endPoint: "Lobuche",
        elevationMeters: 4940,
        walkingHours: 5,
        accommodation: "Basic Alpine Lodge",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d8",
        dayNumber: 8,
        title: "Trek to Gorak Shep (5,164m) & Everest Base Camp (5,364m)",
        description: "Reach the edge of the Khumbu Icefall at Everest Base Camp and return to Gorak Shep for the night.",
        startPoint: "Lobuche",
        endPoint: "Gorak Shep",
        elevationMeters: 5364,
        walkingHours: 8,
        accommodation: "High Altitude Teahouse",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d9",
        dayNumber: 9,
        title: "Summit Kala Patthar (5,545m) & Trek to Dzongla (4,830m)",
        description: "Early morning ascent for iconic sunrise over Everest, then trek across to Dzongla beneath Cholatse.",
        startPoint: "Gorak Shep",
        endPoint: "Dzongla",
        elevationMeters: 5545,
        walkingHours: 7,
        accommodation: "Remote Lodge",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
      {
        id: "d10",
        dayNumber: 10,
        title: "Cross Cho La Pass (5,420m) to Gokyo (4,790m)",
        description: "Ascend the glaciated pass with microspikes and descend beside the Ngozumpa Glacier to the third sacred Gokyo Lake.",
        startPoint: "Dzongla",
        endPoint: "Gokyo",
        elevationMeters: 5420,
        walkingHours: 8,
        accommodation: "Lakeside Lodge",
        mealsProvided: ["breakfast", "lunch", "dinner"],
      },
    ],
    elevationPoints: [
      { distanceKm: 0, elevationMeters: 2840, waypointName: "Lukla", isCamp: true },
      { distanceKm: 9, elevationMeters: 2610, waypointName: "Phakding", isCamp: true },
      { distanceKm: 20, elevationMeters: 3440, waypointName: "Namche", isCamp: true },
      { distanceKm: 32, elevationMeters: 3860, waypointName: "Tengboche", isCamp: true },
      { distanceKm: 43, elevationMeters: 4410, waypointName: "Dingboche", isCamp: true },
      { distanceKm: 52, elevationMeters: 4940, waypointName: "Lobuche", isCamp: true },
      { distanceKm: 60, elevationMeters: 5364, waypointName: "Everest Base Camp", isPass: false },
      { distanceKm: 65, elevationMeters: 5545, waypointName: "Kala Patthar", isPass: true },
      { distanceKm: 78, elevationMeters: 5420, waypointName: "Cho La Pass", isPass: true },
      { distanceKm: 87, elevationMeters: 4790, waypointName: "Gokyo Lakes", isCamp: true },
    ],
    inclusions: [
      "Kathmandu-Lukla return domestic flights & airport taxes",
      "Licensed, wilderness first-aid certified Sherpa guide & porters (2:1 ratio)",
      "All Sagarmatha National Park and local municipality permits",
      "15 nights teahouse and mountain lodge accommodations",
      "Three meals daily (breakfast, lunch, dinner) on trek with hot tea",
      "Pulse oximeter daily oxygen saturation monitoring & medical first aid kit",
      "Emergency satellite phone communication access",
    ],
    exclusions: [
      "International flights to/from Kathmandu",
      "Nepal tourist visa fees",
      "Personal travel, medical & high-altitude helicopter evacuation insurance",
      "Personal trekking equipment (down jacket, sleeping bag)",
      "Hot showers, battery charging, and Wi-Fi in teahouses",
      "Guide and porter gratuity tips",
    ],
    packingChecklist: [
      {
        category: "Clothing & Insulation",
        items: [
          "-15°C down jacket",
          "Waterproof/windproof Gore-Tex shell jacket & pants",
          "Merino wool base layers (top & bottom)",
          "Polartec fleece mid-layer",
          "Trekking trousers & moisture-wicking shirts",
        ],
      },
      {
        category: "Footwear",
        items: [
          "Broken-in waterproof trekking boots with ankle support",
          "Campsite down booties or comfortable slip-ons",
          "4-5 pairs of merino wool trekking socks",
          "Microspikes / crampons for Cho La Pass",
        ],
      },
    ],
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "2",
    slug: "annapurna-circuit",
    title: "Annapurna Circuit & Tilicho Lake High Route",
    region: { id: "reg-2", name: "Annapurna", slug: "annapurna" },
    destination: { id: "dest-1", name: "Nepal", slug: "nepal" },
    difficulty: "strenuous",
    durationDays: 14,
    maxAltitudeMeters: 5416,
    priceFromUSD: 1650,
    featuredImageUrl: "https://images.unsplash.com/photo-1585409677983-0f6c41ca0c33?auto=format&fit=crop&w=800&q=80",
    summary:
      "Cross the legendary Thorong La Pass (5,416m) and visit world-renowned high-altitude Tilicho Lake (4,919m) while transitioning from lush subtropics to Tibetan arid plateaus.",
    ratingAverage: 4.9,
    reviewCount: 98,
    bestSeasons: ["spring", "autumn"],
    metaDescription:
      "Trek the complete Annapurna Circuit including Tilicho Lake and Thorong La Pass. 14-day itinerary with verified local guides.",
    heroImage: {
      url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca0c33?auto=format&fit=crop&w=1600&q=80",
      alt: "Thorong La Pass prayer flags",
    },
    galleryImages: [],
    overviewHtml:
      "<p>The Annapurna Circuit remains one of the world's most ecologically diverse journeys. Traverse deep river gorges, alpine pine forests, Tibetan Buddhist communities, and cross the formidable 5,416m Thorong La Pass into Mustang.</p>",
    highlights: [
      "Cross the famed Thorong La Pass at 5,416 meters",
      "Side excursion to the sacred glacial turquoise Tilicho Lake (4,919m)",
      "Witness Annapurna I, II, III, IV, Dhaulagiri, and Machapuchare (Fishtail)",
      "Explore the holy pilgrimage temples of Muktinath",
    ],
    permitTypesRequired: ["ACAP Permit", "TIMS Card"],
    itinerary: [],
    elevationPoints: [
      { distanceKm: 0, elevationMeters: 1400, waypointName: "Besishahar" },
      { distanceKm: 35, elevationMeters: 3540, waypointName: "Manang", isCamp: true },
      { distanceKm: 55, elevationMeters: 4919, waypointName: "Tilicho Lake", isCamp: true },
      { distanceKm: 75, elevationMeters: 5416, waypointName: "Thorong La Pass", isPass: true },
      { distanceKm: 90, elevationMeters: 3800, waypointName: "Muktinath", isCamp: true },
    ],
    inclusions: [],
    exclusions: [],
    packingChecklist: [],
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "3",
    slug: "manaslu-circuit",
    title: "Manaslu Circuit Remote Sanctuary Trek",
    region: { id: "reg-3", name: "Manaslu", slug: "manaslu" },
    destination: { id: "dest-1", name: "Nepal", slug: "nepal" },
    difficulty: "strenuous",
    durationDays: 15,
    maxAltitudeMeters: 5106,
    priceFromUSD: 1850,
    featuredImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    summary:
      "Nepal's premier off-the-beaten-path restricted trek circling Mount Manaslu (8,163m), the 'Mountain of the Spirit', over the dramatic Larkya La Pass (5,106m).",
    ratingAverage: 4.97,
    reviewCount: 76,
    bestSeasons: ["spring", "autumn"],
    metaDescription:
      "Experience wild Nepal on the Manaslu Circuit Trek. Larkya La pass crossing, authentic Nubri culture, and untouched Himalayan wilderness.",
    heroImage: {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      alt: "Manaslu Himalayan peak",
    },
    galleryImages: [],
    overviewHtml:
      "<p>Circling Mount Manaslu, the world's eighth highest mountain, this restricted area journey preserves untainted Buddhist traditions and ancient trade routes bordering Tibet.</p>",
    highlights: [
      "Circumnavigate Mount Manaslu (8,163m)",
      "Challenging crossing of Larkya La Pass (5,106m)",
      "Tibetan Buddhist monasteries of Samagaon and Samdo",
      "Fewer crowds than Everest or Annapurna",
    ],
    permitTypesRequired: ["Manaslu Restricted Area Permit", "MCAP", "ACAP"],
    itinerary: [],
    elevationPoints: [
      { distanceKm: 0, elevationMeters: 700, waypointName: "Soti Khola" },
      { distanceKm: 40, elevationMeters: 3530, waypointName: "Samagaon", isCamp: true },
      { distanceKm: 60, elevationMeters: 5106, waypointName: "Larkya La Pass", isPass: true },
      { distanceKm: 80, elevationMeters: 1960, waypointName: "Dharapani", isCamp: true },
    ],
    inclusions: [],
    exclusions: [],
    packingChecklist: [],
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "4",
    slug: "upper-mustang",
    title: "Upper Mustang: The Last Forbidden Kingdom",
    region: { id: "reg-4", name: "Mustang", slug: "mustang" },
    destination: { id: "dest-1", name: "Nepal", slug: "nepal" },
    difficulty: "moderate",
    durationDays: 12,
    maxAltitudeMeters: 3840,
    priceFromUSD: 2450,
    featuredImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    summary:
      "Journey behind the Himalayan rainshadow into the walled capital of Lo Manthang, exploring 2,000-year-old sky caves, red rock canyons, and pure Tibetan heritage.",
    ratingAverage: 4.88,
    reviewCount: 52,
    bestSeasons: ["spring", "monsoon", "autumn"],
    metaDescription:
      "Discover the walled kingdom of Lo Manthang in Upper Mustang. Ideal summer rainshadow trek with century-old monasteries and cliff caves.",
    heroImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
      alt: "Mustang red cliff canyon",
    },
    galleryImages: [],
    overviewHtml:
      "<p>Located in the rainshadow of the Annapurna and Dhaulagiri massifs, Upper Mustang is a desolate trans-Himalayan desert filled with eroded sandstone pinnacles, cave temples, and centuries of preserved Tibetan civilization.</p>",
    highlights: [
      "Explore the 15th-century walled capital of Lo Manthang",
      "Marvel at mysterious prehistoric sky caves carved into sheer cliff faces",
      "Trek during the monsoon summer season in total arid comfort",
    ],
    permitTypesRequired: ["Upper Mustang Restricted Area Permit ($500/10 days)", "ACAP Permit"],
    itinerary: [],
    elevationPoints: [
      { distanceKm: 0, elevationMeters: 2720, waypointName: "Jomsom" },
      { distanceKm: 30, elevationMeters: 3050, waypointName: "Chele", isCamp: true },
      { distanceKm: 60, elevationMeters: 3840, waypointName: "Lo Manthang", isCamp: true },
    ],
    inclusions: [],
    exclusions: [],
    packingChecklist: [],
    updatedAt: "2026-03-01T00:00:00Z",
  },
];

export const treksApi = {
  /**
   * Fetches paginated treks with Next.js ISR tag revalidation
   */
  async list(filters: TrekFilters = {}): Promise<PaginatedResponse<TrekSummary>> {
    try {
      return await apiClient.get<PaginatedResponse<TrekSummary>>(API_ENDPOINTS.treks.list, {
        params: filters as Record<string, string | number | boolean | undefined>,
        tags: ["treks-list"],
        revalidate: 3600,
      });
    } catch {
      // Fallback for offline development / pre-DRF database seeding
      let filtered = [...MOCK_TREKS];
      if (filters.difficulty) {
        filtered = filtered.filter((t) => t.difficulty === filters.difficulty);
      }
      if (filters.region) {
        filtered = filtered.filter((t) => t.region.slug === filters.region);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.summary.toLowerCase().includes(query) ||
            t.region.name.toLowerCase().includes(query)
        );
      }

      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      };
    }
  },

  /**
   * Fetches a single trek by slug with ISR revalidation
   */
  async getBySlug(slug: string): Promise<TrekDetail | null> {
    try {
      return await apiClient.get<TrekDetail>(API_ENDPOINTS.treks.detail(slug), {
        tags: [`trek-${slug}`],
        revalidate: 86400,
      });
    } catch {
      const found = MOCK_TREKS.find((t) => t.slug === slug);
      return found || null;
    }
  },

  /**
   * Used by sitemap.ts and generateStaticParams
   */
  async getAllSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    try {
      return await apiClient.get<{ slug: string; updatedAt: string }[]>(
        API_ENDPOINTS.treks.slugs,
        {
          tags: ["treks-slugs"],
          revalidate: 86400,
        }
      );
    } catch {
      return MOCK_TREKS.map((t) => ({ slug: t.slug, updatedAt: t.updatedAt }));
    }
  },
};
