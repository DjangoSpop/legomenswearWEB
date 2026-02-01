/**
 * Axios API client with JWT authentication
 * Handles request/response interceptors and token management
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export const TokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },

  setTokens: (access: string, refresh: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// ============================================================================
// REQUEST INTERCEPTOR - Attach JWT token (skip for public endpoints)
// ============================================================================

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  { method: 'GET', path: '/api/products/' },
  { method: 'GET', path: /^\/api\/products\/[^/]+\/$/ }, // /api/products/{id}/
];

const isPublicEndpoint = (method: string, url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => {
    const methodMatches = endpoint.method === method.toUpperCase();
    if (typeof endpoint.path === 'string') {
      return methodMatches && url.includes(endpoint.path);
    }
    // Regex pattern
    return methodMatches && endpoint.path.test(url);
  });
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isPublic = isPublicEndpoint(config.method || 'GET', config.url || '');

    // Only attach token if NOT a public endpoint
    if (!isPublic) {
      const token = TokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle 401 and refresh token
// ============================================================================

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      // No refresh token available, logout
      TokenStorage.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh token
      const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      TokenStorage.setTokens(access, refreshToken);

      // Update authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access}`;
      }

      processQueue(null, access);
      isRefreshing = false;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;

      // Refresh failed, logout
      TokenStorage.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

// ============================================================================
// ERROR HANDLER
// ============================================================================

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    // Extract detailed error message from Django REST Framework responses
    let message = 'An error occurred';

    if (data) {
      // Check for detail field (common in DRF)
      if (typeof data.detail === 'string') {
        message = data.detail;
      }
      // Check for field-specific errors (validation errors)
      else if (typeof data === 'object') {
        const errors: string[] = [];

        Object.entries(data).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            // Field errors are usually arrays of strings
            errors.push(`${field}: ${value.join(', ')}`);
          } else if (typeof value === 'string') {
            errors.push(`${field}: ${value}`);
          }
        });

        if (errors.length > 0) {
          message = errors.join('; ');
        }
      }
    }

    // Fallback to generic error message
    if (message === 'An error occurred' && error.message) {
      message = error.message;
    }

    return {
      message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
  };
};

export default apiClient;
