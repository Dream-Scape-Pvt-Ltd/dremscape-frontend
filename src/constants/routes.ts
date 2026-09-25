/**
 * Application frontend client routes.
 */

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  DESTINATIONS: '/destinations',
  DESTINATION_DETAIL: (slug: string) => `/destinations/${slug}`,
  TREKS: '/treks',
  TREK_DETAIL: (slug: string) => `/treks/${slug}`,
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: (slug: string) => `/activities/${slug}`,
  /** A departure's booking request: the trek page opens the request popup for it. */
  BOOKING: (trekSlug?: string, departureId?: string) => {
    if (trekSlug && departureId) {
      return `/treks/${encodeURIComponent(trekSlug)}?departure=${encodeURIComponent(departureId)}#departures`;
    }
    return '/treks';
  },
  BOOKING_CONFIRMATION: (reference: string) => `/booking/confirmation/${encodeURIComponent(reference)}`,
  PAYMENT: '/payment',
  ACCOUNT: '/account',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CONTACT: '/contact',
  BLOG: '/blog',
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  GALLERY: '/gallery',
  REVIEWS: '/reviews',
  ADMIN: '/admin',
  SEARCH: (q?: string) => q ? `/search?q=${encodeURIComponent(q)}` : '/search',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_CONDITIONS: '/terms-conditions',
} as const;
