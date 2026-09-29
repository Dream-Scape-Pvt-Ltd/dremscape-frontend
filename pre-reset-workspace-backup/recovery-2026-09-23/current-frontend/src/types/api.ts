/**
 * Standard API Response envelope definitions matching Django REST Framework
 * Dreamscape Treks™ standard envelope structure.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ApiPaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface ApiErrorDetail {
  [field: string]: string[] | string | undefined;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParamValue = string | number | boolean | null | undefined | (string | number | boolean)[];

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: QueryParamValue;
}
