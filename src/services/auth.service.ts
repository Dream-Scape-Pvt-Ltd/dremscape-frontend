import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import {tokenStorage} from '../utils/token-storage.ts';
import type {
  LoginPayload,
  RegisterPayload,
  PasswordResetRequestPayload,
  PasswordResetConfirmPayload,
  AuthResponse,
  UserProfile,
} from '../types/auth.ts';

export const authService = {
  /**
   * Authenticates user against Django REST Framework /api/v1/auth/login/.
   * Stores returned JWT access and refresh tokens.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiClient.post<{
      access: string;
      refresh?: string;
      user: UserProfile;
    }>(API_ENDPOINTS.BACKEND.AUTH.LOGIN, payload, {skipAuth: true});

    if (data?.access) {
      tokenStorage.setTokens(data.access, data.refresh);
    }

    return {
      user: data.user,
      tokens: {
        access: data.access,
        refresh: data.refresh,
      },
      message: 'Login successful.',
    };
  },

  /**
   * Submits user registration to Django REST Framework /api/v1/auth/register/.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await apiClient.post<{
      access?: string;
      refresh?: string;
      user?: UserProfile;
      message?: string;
    }>(API_ENDPOINTS.BACKEND.AUTH.REGISTER, payload, {skipAuth: true});

    if (data?.access) {
      tokenStorage.setTokens(data.access, data.refresh);
    }

    return {
      user: data.user || ({} as UserProfile),
      tokens: data.access ? {access: data.access, refresh: data.refresh} : undefined,
      message: data.message || 'Registration submitted.',
    };
  },

  /**
   * Logs out user by blacklisting the refresh token on backend and clearing storage.
   */
  async logout(): Promise<void> {
    const refresh = tokenStorage.getRefreshToken();
    try {
      if (refresh) {
        await apiClient.post(API_ENDPOINTS.BACKEND.AUTH.LOGOUT, {refresh});
      }
    } catch {
      // Ignore network failure on logout; storage must be cleared regardless
    } finally {
      tokenStorage.clearTokens();
    }
  },

  /**
   * Fetches current authenticated user profile from Django /api/v1/users/me/.
   */
  async getMe(): Promise<{ name: string; user?: UserProfile }> {
    const user = await apiClient.get<UserProfile>(API_ENDPOINTS.BACKEND.USERS.ME);
    return {
      name: user.first_name || user.full_name || user.email,
      user,
    };
  },

  /**
   * Requests password reset instructions email from Django.
   */
  async requestPasswordReset(payload: PasswordResetRequestPayload): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.BACKEND.AUTH.PASSWORD_RESET,
      payload,
      {skipAuth: true}
    );
  },

  /**
   * Confirms password reset with UID and verification token.
   */
  async confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.BACKEND.AUTH.PASSWORD_RESET_CONFIRM,
      payload,
      {skipAuth: true}
    );
  },
};
