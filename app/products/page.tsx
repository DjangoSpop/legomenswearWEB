'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, CategoryEnum, ProductListParams } from '@/lib/types/api';
import { getProducts } from '@/lib/api/catalog';
import ProductGrid from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import Select from '../components/ui/Select';

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Kids', label: 'Kids' },
  { value: 'Shoes', label: 'Shoes' },
  { value: 'Accessories', label: 'Accessories' },
];

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductListParams>({
    category: (searchParams.get('category') as CategoryEnum) || undefined,
    ordering: '-created_at',
    search: searchParams.get('search') || undefined,
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products with filters:', filters);
        const data = await getProducts(filters);
        console.log('Products loaded:', data.length);

        // Defensive check
        if (!Array.isArray(data)) {
          console.error('Products data is not an array:', data);
          setProducts([]);
          setError('Invalid data format received from server');
          return;
        }

        setProducts(data);
      } catch (err: any) {
        console.error('Error loading products:', err);
        const errorMessage = err.message || 'Failed to load products';
        setError(`${errorMessage}. Check browser console for details.`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category ? (category as CategoryEnum) : undefined,
    }));
  };

  const handleSortChange = (ordering: string) => {
    setFilters((prev) => ({
      ...prev,
      ordering: ordering as any,
    }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
    }));
  };

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">
          All Products
        </h1>
        <p className="text-brand-gray">
          {loading ? 'Loading...' : `${products.length} products`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search products..."
            className="input"
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Select
          options={CATEGORIES}
          value={filters.category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="md:w-64"
        />

        <Select
          options={SORT_OPTIONS}
          value={filters.ordering || '-created_at'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="md:w-64"
        />
      </div>

      {/* Products Grid */}
      {loading && <ProductGridSkeleton count={12} />}

      {error && (
        <div className="text-center py-12">
          <p className="text-accent-red mb-4">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-outline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && <ProductGrid products={products} />}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ProductsContent />
    </Suspense>
  );
}
