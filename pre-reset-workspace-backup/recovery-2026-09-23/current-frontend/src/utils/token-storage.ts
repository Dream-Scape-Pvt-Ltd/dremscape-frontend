/**
 * Browser token storage manager for Django REST Framework SimpleJWT tokens.
 */

const ACCESS_TOKEN_KEY = 'dreamscape_access_token';
const REFRESH_TOKEN_KEY = 'dreamscape_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setTokens(access: string, refresh?: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      if (refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      }
    } catch {
      // Storage access blocked or quota exceeded
    }
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Storage access blocked
    }
  },

  hasAccessToken(): boolean {
    return Boolean(this.getAccessToken());
  },
};
