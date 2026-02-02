'use client';

import React from 'react';
import { Product } from '@/lib/types/api';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  priorityCount?: number;
}

export default function ProductGrid({
  products,
  loading = false,
  emptyMessage = 'No products found',
  priorityCount = 4,
}: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-gray-500 text-sm uppercase tracking-wide">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 2-Column Grid - Fashion App Style */}
      <div className="grid grid-cols-2 gap-3 px-3 py-4 md:grid-cols-3 md:gap-4 md:px-4 lg:grid-cols-4 lg:gap-5">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < priorityCount}
          />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton component
function ProductGridSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 px-3 py-4 md:grid-cols-3 md:gap-4 md:px-4 lg:grid-cols-4 lg:gap-5">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            {/* Image skeleton */}
            <div className="relative w-full aspect-[3/4] bg-gray-200 rounded-lg mb-3" />

            {/* Text skeletons */}
            <div className="space-y-2 px-1">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
