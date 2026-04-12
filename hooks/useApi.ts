import { useState, useCallback } from 'react';
import { ApiResponse } from '../types';
import { API_BASE_URL } from '../constants';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (body?: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const result: ApiResponse<T> = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Erro na requisição');
        }

        setData(result.data || null);
        options.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { data, loading, error, execute };
}
