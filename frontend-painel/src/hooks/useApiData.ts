import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiDataOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options: UseApiDataOptions = {}
) {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const execute = useCallback(async () => {
    if (!enabled) return;
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) execute();
    return () => { mountedRef.current = false; };
  }, [execute, enabled]);

  const refetch = useCallback(() => execute(), [execute]);

  return { data, loading, error, refetch, setData };
}

export function useApiDataList<T>(
  fetcher: () => Promise<T[]>,
  deps: any[] = [],
  options: UseApiDataOptions = {}
) {
  const res = useApiData<T[]>(fetcher, deps, options);
  return {
    ...res,
    data: res.data ?? [],
    isEmpty: res.data !== null && res.data.length === 0,
  };
}
