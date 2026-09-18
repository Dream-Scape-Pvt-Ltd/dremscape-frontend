import {buildQueryString} from '../utils/api-helpers.ts';
import {tokenStorage} from '../utils/token-storage.ts';
import type {ApiErrorDetail, ApiErrorResponse, ApiResponse, HttpMethod, QueryParams} from '../types/api.ts';

/**
 * Custom Error class representing an API failure with structured error details,
 * field validation mapping, and status helper getters.
 */
export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public details?: ApiErrorDetail;
  public rawResponse?: unknown;

  constructor(
    messageOrOptions: string | {
      message: string;
      status?: number;
      code?: string;
      details?: ApiErrorDetail;
      rawResponse?: unknown;
    },
    status = 500,
    details?: ApiErrorDetail
  ) {
    if (typeof messageOrOptions === 'string') {
      super(messageOrOptions);
      this.status = status;
      this.code = `HTTP_${status}`;
      this.details = details;
    } else {
      super(messageOrOptions.message);
      this.status = messageOrOptions.status ?? status;
      this.code = messageOrOptions.code ?? `HTTP_${this.status}`;
      this.details = messageOrOptions.details ?? details;
      this.rawResponse = messageOrOptions.rawResponse;
    }
    this.name = 'ApiClientError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  getFieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    if (!this.details || typeof this.details !== 'object') return result;

    for (const [key, value] of Object.entries(this.details)) {
      if (Array.isArray(value) && value.length > 0) {
        result[key] = String(value[0]);
      } else if (typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  baseUrl?: string;
  params?: QueryParams;
  timeoutMs?: number;
  unwrapEnvelope?: boolean; // Defaults to true; unwraps { success: true, data: T }
  token?: string; // Optional manual Bearer token override
  skipAuth?: boolean; // If true, omits automatic Bearer token injection
  retryOn401?: boolean; // Defaults to true; attempts JWT refresh on 401
}

export class ApiClient {
  private defaultBaseUrl: string;
  private defaultTimeoutMs: number;
  private isRefreshing = false;

  constructor(
    defaultBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1',
    defaultTimeoutMs = 15000
  ) {
    this.defaultBaseUrl = defaultBaseUrl;
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  public getBaseUrl(): string {
    return this.defaultBaseUrl;
  }

  public setBaseUrl(url: string): void {
    this.defaultBaseUrl = url;
  }

  /**
   * Normalizes an endpoint for Django REST Framework by ensuring a trailing slash
   * is present before query parameters (unless it has a file extension).
   */
  private normalizeEndpoint(endpoint: string): string {
    let clean = endpoint.trim();
    if (!clean.startsWith('/')) clean = `/${clean}`;

    // Don't append trailing slash if it has a file extension or is root
    if (clean !== '/' && !clean.endsWith('/') && !clean.includes('.')) {
      clean = `${clean}/`;
    }
    return clean;
  }

  /**
   * Core request dispatcher supporting typed responses, DRF trailing slashes,
   * query serialization, timeouts, JWT token injection, and auto-refresh on 401.
   */
  public async request<T = unknown>(
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      baseUrl = this.defaultBaseUrl,
      params,
      timeoutMs = this.defaultTimeoutMs,
      unwrapEnvelope = true,
      token: manualToken,
      skipAuth = false,
      retryOn401 = true,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const queryString = buildQueryString(params);
    const cleanEndpoint = this.normalizeEndpoint(endpoint);
    const cleanBase = baseUrl.replace(/\/$/, '');
    const url = `${cleanBase}${cleanEndpoint}${queryString}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Inject Bearer token from manual parameter or storage
    if (!skipAuth) {
      const activeToken = manualToken || tokenStorage.getAccessToken();
      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }
    }

    let requestBody: string | undefined;
    if (body !== undefined) {
      requestBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          ...headers,
          ...(customHeaders as Record<string, string>),
        },
        body: requestBody,
        signal: AbortSignal.timeout(timeoutMs),
        ...fetchOptions,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new ApiClientError({
          message: 'The request took too long to complete. Please check your connection.',
          status: 408,
          code: 'REQUEST_TIMEOUT',
        });
      }
      throw new ApiClientError({
        message: 'Could not connect to the service. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR',
        rawResponse: err,
      });
    }

    // Attempt automatic JWT refresh on 401 if a refresh token is stored
    if (response.status === 401 && retryOn401 && !this.isRefreshing && !endpoint.includes('auth/')) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        this.isRefreshing = true;
        try {
          const refreshRes = await this.post<{access: string; refresh?: string}>(
            'auth/token/refresh/',
            {refresh: refreshToken},
            {skipAuth: true, retryOn401: false}
          );
          if (refreshRes?.access) {
            tokenStorage.setTokens(refreshRes.access, refreshRes.refresh || refreshToken);
            this.isRefreshing = false;
            // Retry the original failed request with the new access token
            return this.request<T>(endpoint, method, body, {
              ...options,
              token: refreshRes.access,
              retryOn401: false,
            });
          }
        } catch {
          tokenStorage.clearTokens();
        } finally {
          this.isRefreshing = false;
        }
      }
    }

    // Parse JSON payload safely
    const responseData = await response.json().catch(() => null);

    // Evaluate error scenarios: HTTP 4xx/5xx OR envelope with success: false
    if (!response.ok || (responseData && typeof responseData === 'object' && responseData.success === false)) {
      const errorPayload = responseData as ApiErrorResponse | null;
      const errorObj = errorPayload?.error;

      let message = errorObj?.message;
      if (!message) {
        if (response.status === 401) {
          message = 'Please sign in to continue.';
        } else if (response.status === 403) {
          message = 'You do not have permission to perform this action.';
        } else if (response.status === 404) {
          message = 'The requested resource was not found.';
        } else if (response.status >= 500) {
          message = 'The service is temporarily unavailable. Please try again later.';
        } else {
          message = 'The request could not be completed.';
        }
      }

      throw new ApiClientError({
        message,
        status: response.status || 500,
        code: errorObj?.code || `HTTP_${response.status}`,
        details: errorObj?.details,
        rawResponse: responseData,
      });
    }

    // Unpack standard envelope if present and requested
    if (unwrapEnvelope && responseData && typeof responseData === 'object' && 'success' in responseData) {
      const envelope = responseData as ApiResponse<T>;
      return envelope.data;
    }

    return responseData as T;
  }

  public get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  public post<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, options);
  }

  public put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body, options);
  }

  public patch<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body, options);
  }

  public delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}

/**
 * Singleton API client instance configured directly for Django REST Framework.
 */
export const apiClient = new ApiClient();
