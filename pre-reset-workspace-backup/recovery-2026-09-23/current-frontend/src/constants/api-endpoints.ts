/**
 * API Endpoints dictionary.
 *
 * Covers both:
 * 1. Next.js internal BFF routes (/api/...) called by client-side browser code
 *    to preserve HttpOnly cookies and protect backend credentials.
 * 2. Django backend API endpoints (/api/v1/...) called by server-side adapters or proxy.
 */

export const API_ENDPOINTS = {
  // Client-side routes proxied via Next.js route handlers
  CLIENT: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      ME: '/api/account',
      RESET: '/api/auth/reset',
      CONFIRM: '/api/auth/confirm',
    },
    TRIPS: {
      LIST: '/api/trips',
      DETAIL: (slug: string) => `/api/trips/${slug}`,
    },
    BOOKINGS: {
      CREATE: '/api/bookings',
      DETAIL: (reference: string) => `/api/bookings/${reference}`,
    },
    INQUIRIES: {
      CREATE: '/api/inquiries',
    },
    REVIEWS: {
      LIST_OR_CREATE: '/api/reviews',
    },
    ADMIN: {
      DATA: '/api/admin',
    },
  },

  // Direct Django Backend API v1 Endpoints (used by Next.js Server Components & Route Handlers)
  BACKEND: {
    AUTH: {
      LOGIN: 'auth/login/',
      REGISTER: 'auth/register/',
      LOGOUT: 'auth/logout/',
      REFRESH: 'auth/token/refresh/',
      PASSWORD_RESET: 'auth/password/reset/',
      PASSWORD_RESET_CONFIRM: 'auth/password/reset/confirm/',
      PASSWORD_CHANGE: 'auth/password/change/',
    },
    USERS: {
      ME: 'users/me/',
      LIST: 'users/',
      DETAIL: (id: string) => `users/${id}/`,
    },
    TRIPS: {
      LIST: 'trips/',
      HIGHLIGHTS: 'trips/highlights/',
      DETAIL: (slug: string) => `trips/${slug}/`,
      ITINERARY: (slug: string) => `trips/${slug}/itinerary/`,
      ITINERARY_DAY: (slug: string, day: number) => `trips/${slug}/itinerary/${day}/`,
      DEPARTURES: (slug: string) => `trips/${slug}/departures/`,
      DEPARTURE_DETAIL: (slug: string, departureId: string) => `trips/${slug}/departures/${departureId}/`,
      REVIEWS: (slug: string) => `trips/${slug}/reviews/`,
      EXPEDITION_DETAIL: (slug: string) => `trips/${slug}/expedition-detail/`,
    },
    DESTINATIONS: {
      LIST: 'destinations/',
      DETAIL: (slug: string) => `destinations/${slug}/`,
      CATEGORIES: 'destinations/activity-categories/',
      CATEGORY_DETAIL: (slug: string) => `destinations/activity-categories/${slug}/`,
    },
    BOOKINGS: {
      LIST_CREATE: 'bookings/',
      DETAIL: (reference: string) => `bookings/${reference}/`,
      CANCEL: (reference: string) => `bookings/${reference}/cancel/`,
      PASSENGERS: (reference: string) => `bookings/${reference}/passengers/`,
      PASSENGER_DETAIL: (reference: string, id: string) => `bookings/${reference}/passengers/${id}/`,
    },
    PAYMENTS: {
      INITIATE: 'payments/initiate/',
      VERIFY: 'payments/verify/',
      DETAIL: (id: string) => `payments/${id}/`,
    },
    INQUIRIES: {
      LIST_CREATE: 'inquiries/',
      DETAIL: (reference: string) => `inquiries/${reference}/`,
      NOTES: (reference: string) => `inquiries/${reference}/notes/`,
    },
    SEARCH: {
      QUERY: 'search/',
    },
    CONTENT: {
      GUIDES: 'content/guides/',
      GUIDE_DETAIL: (slug: string) => `content/guides/${slug}/`,
    },
    FAQS: {
      LIST: 'faqs/',
    },
  },
} as const;
