'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types/api';
import { getProducts, deleteProduct } from '@/lib/api/catalog';
import { useRequireAdmin } from '@/lib/hooks/useAuth';
import { useAuth } from '@/app/context/AuthContext';
import ProductGrid from '../../components/product/ProductGrid';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, authorized, loading: authLoading } = useRequireAdmin();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && authorized) {
      loadProducts();
    }
  }, [authLoading, authorized]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Show loading state while checking authorization
  if (authLoading) {
    return (
      <div className="container-page py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black"></div>
          <p className="mt-4 text-brand-gray">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized (hook will redirect)
  if (!authorized) {
    return null;
  }

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-brand-gray">
            Welcome, {user?.username} • {products.length} products
          </p>
        </div>

        <Link href="/admin/add-product" className="btn-primary">
          Add Product
        </Link>
      </div>

      {loading && <ProductGridSkeleton count={12} />}

      {error && (
        <div className="text-center py-12">
          <p className="text-accent-red mb-4">{error}</p>
          <Button onClick={loadProducts}>Retry</Button>
        </div>
      )}

      {!loading && !error && <ProductGrid products={products} />}
    </div>
  );
}
