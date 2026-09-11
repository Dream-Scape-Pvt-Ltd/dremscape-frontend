import { env } from "@/config/env";
import { ApiClientError } from "./errors";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  tags?: string[];
  revalidate?: number | false;
}

export class ApiClient {
  private getBaseUrl(): string {
    if (typeof window === "undefined" && env.DJANGO_INTERNAL_API_URL) {
      return env.DJANGO_INTERNAL_API_URL;
    }
    return env.NEXT_PUBLIC_API_BASE_URL;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, tags, revalidate, headers = {}, ...customConfig } = options;

    const url = new URL(`${this.getBaseUrl()}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(headers as Record<string, string>),
    };

    const nextConfig: { tags?: string[]; revalidate?: number | false } = {};
    if (tags) nextConfig.tags = tags;
    if (revalidate !== undefined) nextConfig.revalidate = revalidate;

    const config: RequestInit = {
      ...customConfig,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      ...(Object.keys(nextConfig).length > 0 ? { next: nextConfig } : {}),
    };

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiClientError(
          errorData?.detail || `API request failed with HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : "Network error communicating with Django backend",
        500
      );
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
