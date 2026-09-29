import type {QueryParams, ApiErrorDetail, ApiErrorResponse} from '../types/api';

/**
 * Serializes an object of query parameters into a URL query string.
 * Filters out undefined, null, or empty string values.
 * Handles arrays as multiple keys or comma-separated depending on configuration.
 */
export function buildQueryString(params?: QueryParams): string {
  if (!params || Object.keys(params).length === 0) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Extracts a human-readable error message and optional field validation errors from any error.
 */
export function parseApiError(error: unknown): {
  message: string;
  code: string;
  status?: number;
  details?: ApiErrorDetail;
} {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      message?: string;
      code?: string;
      status?: number;
      fields?: ApiErrorDetail;
      details?: ApiErrorDetail;
      error?: ApiErrorResponse['error'];
    };

    if (candidate.error) {
      return {
        message: candidate.error.message || 'An error occurred.',
        code: candidate.error.code || 'ERROR',
        details: candidate.error.details,
      };
    }

    if (candidate.message) {
      return {
        message: candidate.message,
        code: candidate.code || 'ERROR',
        status: candidate.status,
        details: candidate.details || candidate.fields,
      };
    }
  }

  if (typeof error === 'string') {
    return { message: error, code: 'ERROR' };
  }

  return { message: 'An unexpected error occurred. Please try again.', code: 'UNKNOWN_ERROR' };
}
