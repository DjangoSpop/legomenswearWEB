'use client';

/**
 * Authentication Context Provider
 * Manages user authentication state, login/logout, and role-based access control
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, register as apiRegister, getProfile, logout as apiLogout } from '@/lib/api/auth';
import { LoginRequest, UserRegistrationRequest, User, RoleEnum } from '@/lib/types/api';
import { TokenStorage } from '@/lib/api/client';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: UserRegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Role helpers
  hasRole: (role: RoleEnum | RoleEnum[]) => boolean;
  canAccessAdmin: () => boolean;
  isBuyer: () => boolean;
  isSeller: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = TokenStorage.getUser();
        const accessToken = TokenStorage.getAccessToken();

        if (storedUser && accessToken) {
          // Validate token by fetching current profile
          try {
            const profile = await getProfile();
            setUser(profile);
          } catch (error) {
            // Token invalid, clear storage
            console.error('Token validation failed:', error);
            TokenStorage.clearTokens();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================================================
  // LOGIN
  // ============================================================================

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await apiLogin(credentials);

      let userData = response.user;

      // If user data not included in login response, fetch profile
      if (!userData) {
        try {
          userData = await getProfile();
        } catch (profileError) {
          console.error('Failed to fetch profile after login:', profileError);
          throw new Error('Login successful but failed to fetch user profile');
        }
      }

      if (userData) {
        setUser(userData);

        // Role-based redirect
        console.log('Redirecting user with role:', userData.role);
        if (userData.role === 'buyer') {
          router.push('/products');
        } else if (userData.role === 'seller' || userData.role === 'admin') {
          router.push('/admin/products');
        } else {
          // Fallback redirect
          router.push('/products');
        }
      } else {
        throw new Error('No user data available after login');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [router]);

  // ============================================================================
  // REGISTER
  // ============================================================================

  const register = useCallback(async (data: UserRegistrationRequest) => {
    try {
      const response = await apiRegister(data);

      // Check if backend returned tokens directly
      if (response.access && response.refresh) {
        // Tokens received, fetch user profile if not included
        if (response.user) {
          setUser(response.user);

          // Role-based redirect
          if (response.user.role === 'buyer') {
            router.push('/products');
          } else if (response.user.role === 'seller' || response.user.role === 'admin') {
            router.push('/admin/products');
          }
        } else {
          // Fetch profile to get user data
          try {
            const profile = await getProfile();
            setUser(profile);

            // Role-based redirect
            if (profile.role === 'buyer') {
              router.push('/products');
            } else if (profile.role === 'seller' || profile.role === 'admin') {
              router.push('/admin/products');
            }
          } catch (profileError) {
            console.error('Failed to fetch profile after registration:', profileError);
            // Fallback to login
            await login({ username: data.username, password: data.password });
          }
        }
      } else {
        // No tokens returned, need to login
        await login({ username: data.username, password: data.password });
      }
    } catch (error) {
      // Ensure error is properly formatted for display
      console.error('Registration error:', error);
      throw error;
    }
  }, [login, router]);

  // ============================================================================
  // LOGOUT
  // ============================================================================

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      TokenStorage.clearTokens();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // ============================================================================
  // REFRESH USER
  // ============================================================================

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      TokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  // ============================================================================
  // ROLE HELPERS
  // ============================================================================

  const hasRole = useCallback((role: RoleEnum | RoleEnum[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

  const canAccessAdmin = useCallback((): boolean => {
    return hasRole(['seller', 'admin']);
  }, [hasRole]);

  const isBuyer = useCallback((): boolean => {
    return hasRole('buyer');
  }, [hasRole]);

  const isSeller = useCallback((): boolean => {
    return hasRole('seller');
  }, [hasRole]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    canAccessAdmin,
    isBuyer,
    isSeller,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
