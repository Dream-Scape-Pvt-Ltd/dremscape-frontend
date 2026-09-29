export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiErrorResponse {
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  nonFieldErrors?: string[];
}
