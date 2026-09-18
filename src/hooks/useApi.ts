'use client';

import {useState, useCallback} from 'react';
import {ApiClientError} from '../services/api-client';
import type {ApiErrorDetail} from '../types/api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  fieldErrors?: ApiErrorDetail;
}

export interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Reusable async lifecycle hook for API operations.
 * Tracks data, loading status, error messages, and field-level validation errors.
 */
export function useApi<T, P extends unknown[]>(
  apiFn: (...args: P) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiErrorDetail | undefined>(undefined);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setErrorCode(null);
    setFieldErrors(undefined);
  }, [initialData]);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      setFieldErrors(undefined);

      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setError(err.message);
          setErrorCode(err.code);
          setFieldErrors(err.details);
        } else if (err instanceof Error) {
          setError(err.message);
          setErrorCode('ERROR');
        } else {
          setError('An unexpected error occurred.');
          setErrorCode('UNKNOWN_ERROR');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return {
    data,
    loading,
    error,
    errorCode,
    fieldErrors,
    execute,
    reset,
    setData,
  };
}
