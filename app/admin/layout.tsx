'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check authorization
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'seller'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black mx-auto mb-4"></div>
          <p className="text-brand-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authorized (will redirect)
  if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Admin Header */}
      <div className="bg-white border-b border-brand-lightgray sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-h4 font-medium">Admin Panel</h1>
              <nav className="flex gap-2">
                <Link
                  href="/admin/orders"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/orders')
                      ? 'bg-brand-black text-white'
                      : 'text-brand-gray hover:bg-brand-lightgray hover:text-brand-black'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  href="/admin/products"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/products')
                      ? 'bg-brand-black text-white'
                      : 'text-brand-gray hover:bg-brand-lightgray hover:text-brand-black'
                  }`}
                >
                  Products
                </Link>
                <Link
                  href="/admin/add-product"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/add-product')
                      ? 'bg-brand-black text-white'
                      : 'text-brand-gray hover:bg-brand-lightgray hover:text-brand-black'
                  }`}
                >
                  Add Product
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-body text-brand-gray">
                {user.firstName || user.username} {user.lastName || ''}
              </span>
              <span className="px-3 py-1 bg-brand-black text-white rounded-full text-caption">
                {user.role}
              </span>
              <Link
                href="/products"
                className="text-body text-brand-gray hover:text-brand-black transition-colors"
              >
                View Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
