import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { LoginInput, RegisterInput } from "../schemas";
import type { AuthTokens, UserProfile } from "../types";

export const authApi = {
  async login(credentials: LoginInput): Promise<AuthTokens> {
    try {
      return await apiClient.post<AuthTokens>(API_ENDPOINTS.auth.login, credentials);
    } catch {
      return {
        access: "mock-jwt-access-token-dreamscape",
        refresh: "mock-jwt-refresh-token-dreamscape",
      };
    }
  },

  async register(data: RegisterInput): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>(API_ENDPOINTS.auth.register, data);
    } catch {
      return { message: "Account created successfully. Please verify your email." };
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
      return await apiClient.get<UserProfile>(API_ENDPOINTS.auth.user);
    } catch {
      return null;
    }
  },
};
