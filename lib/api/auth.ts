/**
 * Authentication API endpoints
 * Handles login, registration, and token management
 */

import apiClient, { handleApiError, TokenStorage } from './client';
import {
  LoginRequest,
  LoginResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  UserRegistrationRequest,
  User,
} from '@/lib/types/api';

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

/**
 * Login with username and password
 * POST /api/token/
 * Returns JWT tokens and user data
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // Try the correct endpoint first: /api/token/
    const response = await apiClient.post<LoginResponse>('/api/token/', credentials);

    // Store tokens and user data
    if (response.data.access && response.data.refresh) {
      TokenStorage.setTokens(response.data.access, response.data.refresh);
    }

    if (response.data.user) {
      TokenStorage.setUser(response.data.user);
    }

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Register new user
 * POST /api/auth/register/
 * Backend may return tokens directly or just user data
 */
export const register = async (data: UserRegistrationRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<any>('/api/auth/register/', data);

    // Check if backend returned tokens (Django might return tokens directly on registration)
    if (response.data.access && response.data.refresh) {
      // Backend returned tokens - store them
      TokenStorage.setTokens(response.data.access, response.data.refresh);

      // If user data is included, store it
      if (response.data.user) {
        TokenStorage.setUser(response.data.user);
      }

      return response.data as LoginResponse;
    } else {
      // Backend returned only user data - will need to login separately
      return {
        access: '',
        refresh: '',
        user: response.data,
      };
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Refresh access token
 * POST /api/token/refresh/
 */
export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<TokenRefreshResponse>('/api/token/refresh/', {
      refresh: refreshToken,
    });

    // Update stored access token
    TokenStorage.setTokens(response.data.access, refreshToken);

    return response.data.access;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile/
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/api/auth/profile/');
    TokenStorage.setUser(response.data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update user profile
 * PATCH /api/auth/profile/
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.patch<User>('/api/auth/profile/', data);
    TokenStorage.setUser(response.data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Logout - clear tokens and user data
 * Returns a Promise for consistency with other async auth operations
 */
export const logout = async (): Promise<void> => {
  TokenStorage.clearTokens();
  // Return resolved promise
  return Promise.resolve();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!TokenStorage.getAccessToken();
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = (): User | null => {
  return TokenStorage.getUser();
};

/**
 * Check if user has seller or admin role
 */
export const canManageProducts = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'seller' || user?.role === 'admin';
};
