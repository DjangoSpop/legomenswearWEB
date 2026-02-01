'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Product } from '@/lib/types/api';
import { getFeaturedProducts } from '@/lib/api/catalog';
import ProductGrid from './components/product/ProductGrid';
import { ProductGridSkeleton } from './components/ui/Skeleton';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legomenswear.com';

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching featured products...');
        const products = await getFeaturedProducts(8);
        console.log('Featured products loaded:', products.length);
        setFeaturedProducts(products);
      } catch (err: any) {
        console.error('Error loading products:', err);
        const errorMessage = err.message || 'Failed to load products';
        setError(`${errorMessage}. Please check console for details.`);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // BreadcrumbList schema for home page
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <div>
      {/* Hero Section */}
      <section className="relative bg-brand-black text-white">
        <div className="container-page py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-light mb-6 tracking-tight">
              LEGO MENS WEAR
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Discover premium menswear designed for the modern gentleman.
              Quality, style, and comfort in every piece.
            </p>
            <Link href="/products" className="btn-outline inline-block">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-page py-16 md:py-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">
            New Arrivals
          </h2>
          <Link href="/products" className="text-body link">
            View All
          </Link>
        </div>

        {loading && <ProductGridSkeleton count={8} />}

        {error && (
          <div className="text-center py-12">
            <p className="text-accent-red mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-outline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && <ProductGrid products={featuredProducts} />}
      </section>

      {/* Categories Section */}
      <section className="container-page pb-16 md:pb-24">
        <h2 className="micro-label mb-6">SHOP BY CATEGORY</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Men', category: 'Men' },
            { name: 'Shoes', category: 'Shoes' },
            { name: 'Accessories', category: 'Accessories' },
            { name: 'Sale', category: '' },
          ].map((item) => (
            <Link
              key={item.name}
              href={`/products${item.category ? `?category=${item.category}` : ''}`}
              className="group block card p-8 hover:border-brand-black transition-colors"
            >
              <h3 className="text-xl font-medium group-hover:text-brand-gray transition-colors">
                {item.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
