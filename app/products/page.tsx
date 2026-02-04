'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, CategoryEnum, ProductListParams } from '@/lib/types/api';
import { getProducts } from '@/lib/api/catalog';
import ProductGrid from '../components/product/ProductGrid';
import CategorySelector, { MENS_WEAR_CATEGORIES } from '../components/product/CategorySelector';

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

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('subcategory') || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [sortOrder, setSortOrder] = useState<string>('-created_at');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ProductListParams = {
        category: 'Men' as CategoryEnum, // Focus on Men's wear
        ordering: sortOrder as any,
        search: searchQuery || undefined,
      };

      console.log('Fetching products with filters:', filters);
      const data = await getProducts(filters);

      // Filter by subcategory if selected (client-side)
      let filteredData = data;
      if (selectedCategory) {
        filteredData = data.filter((product) => {
          const subcategory = product.subcategory?.toLowerCase();
          return subcategory === selectedCategory.toLowerCase();
        });
      }

      console.log('Products loaded:', filteredData.length);
      setProducts(filteredData);
    } catch (err: any) {
      console.error('Error loading products:', err);
      const errorMessage = err.message || 'Failed to load products';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-8 md:py-12">
        <div className="container-page">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-2 uppercase">
            Men&apos;s Collection
          </h1>
          <p className="text-gray-400 text-sm md:text-base tracking-wide">
            {loading ? 'Loading...' : `${products.length} styles available`}
          </p>
        </div>
      </div>

      {/* Category Selector */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <CategorySelector
          categories={MENS_WEAR_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Filter Bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container-page py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search-input" className="sr-only">
                Search products
              </label>
              <input
                id="search-input"
                type="search"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:border-black focus:outline-none transition-colors tap-scale"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="sm:w-56">
              <label htmlFor="sort-select" className="sr-only">
                Sort products
              </label>
              <select
                id="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 focus:border-black focus:outline-none transition-colors appearance-none bg-white cursor-pointer tap-scale"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-gray-50">
        {loading && (
          <div className="container-page py-8">
            <ProductGrid products={[]} loading={true} />
          </div>
        )}

        {error && (
          <div className="container-page py-16 text-center">
            <p className="text-red-600 mb-4 text-sm uppercase tracking-wide">{error}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wide hover:bg-gray-900 transition-colors active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="container-page py-16 text-center">
                <div className="max-w-md mx-auto">
                  <svg
                    className="w-20 h-20 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 uppercase tracking-wide">
                    No Products Found
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchQuery('');
                    }}
                    className="px-6 py-2 border border-black text-black text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <ProductGrid products={[]} loading={true} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
