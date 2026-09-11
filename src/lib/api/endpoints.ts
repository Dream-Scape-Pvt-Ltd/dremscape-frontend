export const API_ENDPOINTS = {
  // Treks & Expeditions
  treks: {
    list: "/api/v1/treks/",
    detail: (slug: string) => `/api/v1/treks/${slug}/`,
    slugs: "/api/v1/treks/slugs/",
    featured: "/api/v1/treks/featured/",
    elevation: (slug: string) => `/api/v1/treks/${slug}/elevation/`,
    departures: (slug: string) => `/api/v1/treks/${slug}/departures/`,
  },
  // Destinations & Regions
  destinations: {
    list: "/api/v1/destinations/",
    detail: (slug: string) => `/api/v1/destinations/${slug}/`,
  },
  regions: {
    list: "/api/v1/regions/",
    detail: (slug: string) => `/api/v1/regions/${slug}/`,
  },
  // Bookings & Inquiries
  bookings: {
    create: "/api/v1/bookings/",
    detail: (reference: string) => `/api/v1/bookings/${reference}/`,
  },
  inquiries: {
    submit: "/api/v1/inquiries/",
  },
  // Reviews & Community
  reviews: {
    list: "/api/v1/reviews/",
    submit: "/api/v1/reviews/",
  },
  // Blog & Travel Guides
  blog: {
    list: "/api/v1/blog/posts/",
    detail: (slug: string) => `/api/v1/blog/posts/${slug}/`,
  },
  // Search
  search: {
    query: "/api/v1/search/",
  },
  // Authentication
  auth: {
    login: "/api/v1/auth/token/",
    refresh: "/api/v1/auth/token/refresh/",
    register: "/api/v1/auth/register/",
    user: "/api/v1/auth/user/",
  },
} as const;
