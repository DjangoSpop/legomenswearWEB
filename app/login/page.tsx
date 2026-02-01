'use client';

/**
 * Login Page
 * Handles user authentication with role-based redirection
 * - Buyers → /products
 * - Sellers/Admins → /admin/products
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/products');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      // AuthContext handles role-based redirect
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-md mx-auto">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">Welcome Back</h1>
            <p className="text-brand-gray">Sign in to your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red text-accent-red text-sm rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              loading={loading || authLoading}
              disabled={loading || authLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center border-t border-brand-gray/20 pt-6">
            <p className="text-sm text-brand-gray">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="text-brand-black font-medium hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-brand-gray">
              Buyers, sellers, and admins welcome
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
