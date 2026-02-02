'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/api';
import { useCartStore } from '@/lib/store/cart';
import ImageCarousel from './ImageCarousel';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const isNew = () => {
    const createdDate = new Date(product.createdAt);
    const daysSinceCreation = Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation <= 14; // New if created within 14 days
  };

  const isBestSeller = () => {
    return product.rating >= 4.5 && product.reviewCount >= 10;
  };

  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  // Check if at least one size is available
  const hasAvailableSize = () => {
    if (!product.sizes || product.sizes.length === 0) return true; // No sizes = always available
    if (!product.sizeQuantities) return true; // No size quantities specified = assume available
    return product.sizes.some((size) => (product.sizeQuantities?.[size] || 0) > 0);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock || isAdding || isAdded) return;

    setIsAdding(true);

    const displayPrice = product.discountedPrice && product.discountedPrice > 0
      ? product.discountedPrice
      : product.price;

    // For quick add, use selected size if available, otherwise use first available size
    let sizeToAdd: string | undefined;
    if (product.sizes && product.sizes.length > 0) {
      if (selectedSize) {
        // User selected a specific size
        sizeToAdd = selectedSize;
      } else if (product.sizeQuantities) {
        // Find first size with available quantity
        sizeToAdd = product.sizes.find(
          (size) => (product.sizeQuantities?.[size] || 0) > 0
        );
      } else {
        // No size quantities specified, use first size
        sizeToAdd = product.sizes[0];
      }
    }

    // Add to cart
    addItem({
      productId: product.id,
      name: product.name,
      barcode: product.barcode,
      unitPrice: displayPrice,
      selectedSize: sizeToAdd,
      image: product.primaryImage || product.imagePaths[0],
      category: product.category,
      shareUrl: typeof window !== 'undefined'
        ? `${window.location.origin}/products/${product.id}`
        : `/products/${product.id}`,
    });

    // Show success feedback
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 600);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]">
        {/* Image Container with Carousel */}
        <div className="relative">
          <ImageCarousel
            images={product.imagePaths}
            alt={product.name}
            priority={priority}
          />

          {/* Badges Container - Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {isNew() && (
              <span className="px-2 py-1 bg-black text-white text-xs font-medium tracking-wide">
                NEW
              </span>
            )}
            {isBestSeller() && (
              <span className="px-2 py-1 bg-neutral-800 text-white text-xs font-medium tracking-wide">
                BEST SELLER
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold tracking-wide">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Favorite Button - Top Right */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm active:scale-90 transition-transform duration-200"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                isFavorited ? 'fill-red-500 text-red-500' : 'fill-none text-gray-700'
              }`}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          </button>

          {/* Quick Add Button - Bottom Right */}
          {product.inStock && hasAvailableSize() && (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding || isAdded}
              title={
                selectedSize
                  ? `Add size ${selectedSize} to cart`
                  : 'Quick add to cart'
              }
              className={`absolute bottom-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 group-hover:scale-110 ${
                isAdded
                  ? 'bg-green-600 text-white scale-110'
                  : selectedSize
                  ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                  : 'bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-black hover:text-white active:scale-90'
              }`}
              aria-label={
                selectedSize
                  ? `Add size ${selectedSize} to cart`
                  : 'Quick add to cart'
              }
            >
              {isAdding ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : isAdded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-15">
              <span className="px-4 py-2 bg-black text-white text-sm font-medium tracking-wide">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-1">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wider font-light">
            {product.category}
            {product.subcategory && ` • ${product.subcategory}`}
          </p>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            {hasDiscount ? (
              <>
                <span className="text-base font-bold text-gray-900">
                  ${product.discountedPrice?.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Available Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
                {selectedSize ? `Selected: ${selectedSize}` : 'Select Size'}
              </p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.slice(0, 6).map((size) => {
                  // Check if this size is available (if sizeQuantities exists)
                  const isAvailable = product.sizeQuantities
                    ? (product.sizeQuantities[size] || 0) > 0
                    : true;

                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isAvailable) {
                          setSelectedSize(isSelected ? null : size);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`px-2 py-0.5 text-xs border rounded transition-all duration-200 ${
                        isSelected
                          ? 'border-black bg-black text-white font-medium'
                          : isAvailable
                          ? 'border-gray-300 text-gray-700 bg-white hover:border-gray-900 active:scale-95 cursor-pointer'
                          : 'border-gray-200 text-gray-400 bg-gray-50 line-through cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
                {product.sizes.length > 6 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{product.sizes.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stock Warning */}
          {product.inStock && product.quantity <= 5 && product.quantity > 0 && (
            <p className="text-xs text-orange-600 font-medium pt-1">
              Only {product.quantity} left
            </p>
          )}

          {/* Rating (subtle) */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 pt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'text-gray-900 fill-current'
                        : 'text-gray-300 fill-current'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
