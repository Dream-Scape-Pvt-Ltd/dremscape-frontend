import {destinationHref, isUuid, storyHref, trekHref} from '../lib/links.ts';
/**
 * Application frontend client routes.
 */

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  DESTINATIONS: '/destinations',
  DESTINATION_DETAIL: (id: string) => destinationHref(id),
  TREKS: '/treks',
  TREK_DETAIL: (id: string) => trekHref(id),
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: (slug: string) => `/activities/${slug}`,
  /**
   * A departure's booking request: the trek page opens the request popup for it.
   * Takes the trek's id; an old slug goes through /treks/<slug>, which redirects to the id address.
   */
  BOOKING: (trek?: string, departureId?: string) => {
    if (!trek || !departureId) return '/treks';
    if (isUuid(trek)) return `${trekHref(trek, {departure: departureId})}#book`;
    return `/treks/${encodeURIComponent(trek)}?departure=${encodeURIComponent(departureId)}#book`;
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
  BLOG_DETAIL: (id: string) => storyHref(id),
  GALLERY: '/gallery',
  REVIEWS: '/reviews',
  ADMIN: '/admin',
  SEARCH: (q?: string) => q ? `/search?q=${encodeURIComponent(q)}` : '/search',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_CONDITIONS: '/terms-conditions',
} as const;
