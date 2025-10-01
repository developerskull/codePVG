import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, refreshToken } = useAuth();

  const request = useCallback(async <T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const { method = 'GET', headers = {}, body } = options;
      
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...headers,
        },
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      let response = await fetch(`${apiUrl}${endpoint}`, config);

      // If token is expired (401), try to refresh it and retry the request
      if (response.status === 401 && token) {
        console.log('Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with the new token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          response = await fetch(`${apiUrl}${endpoint}`, retryConfig);
        } else {
          // If refresh failed, the user will be logged out automatically
          // by the AuthContext, so we can just throw an error
          throw new Error('Authentication failed. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const get = useCallback(<T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, { method: 'GET', headers }), [request]);

  const post = useCallback(<T>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    request<T>(endpoint, { method: 'POST', body, headers }), [request]);

  const put = useCallback(<T>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    request<T>(endpoint, { method: 'PUT', body, headers }), [request]);

  const del = useCallback(<T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, { method: 'DELETE', headers }), [request]);

  return {
    request,
    get,
    post,
    put,
    delete: del,
    loading,
    error,
    clearError: () => setError(null),
  };
};
