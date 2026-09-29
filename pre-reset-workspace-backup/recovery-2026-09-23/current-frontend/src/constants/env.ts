/**
 * Application environment configuration and runtime helpers.
 */

export const ENV = {
  /**
   * Django backend API root URL (server-side only).
   * Example: http://127.0.0.1:8000/api/v1
   */
  BACKEND_API_URL: process.env.BACKEND_API_URL?.replace(/\/$/, '') || '',

  /**
   * Optional public API URL for direct client requests if configured.
   */
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '',

  /**
   * Company contact email
   */
  COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'dreamscapetrek@gmail.com',

  /**
   * Company contact WhatsApp phone number
   */
  COMPANY_WHATSAPP: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '',

  /**
   * Optional trek film video URL
   */
  TREK_FILM_URL: process.env.NEXT_PUBLIC_TREK_FILM_URL || '',

  /**
   * Execution environment checks
   */
  IS_SERVER: typeof window === 'undefined',
  IS_CLIENT: typeof window !== 'undefined',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

export const hasBackendConfigured = (): boolean => Boolean(ENV.BACKEND_API_URL);
