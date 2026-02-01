/**
 * Custom hooks for authentication
 */

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RoleEnum } from '@/lib/types/api';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  return { isAuthenticated, loading };
}

/**
 * Hook to protect routes that require specific roles
 * Redirects to home if user doesn't have required role
 */
export function useRequireRole(roles: RoleEnum | RoleEnum[]) {
  const { user, hasRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!hasRole(roles)) {
        router.push('/products');
      }
    }
  }, [user, hasRole, loading, router, roles]);

  return { authorized: user && hasRole(roles), loading };
}

/**
 * Hook to protect admin routes
 */
export function useRequireAdmin() {
  const { user, loading } = useAuth();
  const result = useRequireRole(['seller', 'admin']);

  return {
    ...result,
    user,
    loading: result.loading || loading,
  };
}
