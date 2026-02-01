'use client';

import Link from 'next/link';
import { Product } from '@/lib/types/api';
import Price from '../ui/Price';
import { useState } from 'react';
import ShareButton from './ShareButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayPrice = product.discountedPrice && product.discountedPrice > 0
    ? product.discountedPrice
    : product.price;

  const hasDiscount = product.discountedPrice && product.discountedPrice > 0;

  // Safe image URL
  const imageUrl = product.imagePaths && product.imagePaths.length > 0
    ? product.imagePaths[0]
    : null;

  return (
    <div className="space-y-3">
      <Link href={`/products/${product.id}`} className="group block" suppressHydrationWarning>
        {/* Image */}
        <div className="relative aspect-product bg-brand-lightgray overflow-hidden mb-3">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error('Failed to load image:', imageUrl);
                console.error('Image element:', e.currentTarget);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('✓ Image loaded successfully:', imageUrl);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-gray text-sm">
              {imageError ? 'Image failed to load' : 'No Image'}
            </div>
          )}

          {/* Sale Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-accent-sale text-white px-2 py-1 text-xs uppercase tracking-wider">
              Sale
            </div>
          )}

          {/* Stock Status Badges */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <span className="text-sm uppercase tracking-wider text-brand-gray font-medium">
                Out of Stock
              </span>
            </div>
          )}

          {product.inStock && product.quantity > 0 && product.quantity <= 5 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs uppercase tracking-wider">
              Only {product.quantity} Left
            </div>
          )}

          {/* Share Button on Hover */}
          {/* <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div onClick={(e) => e.preventDefault()}>
              <ShareButton
                productName={product.name}
                productUrl={`/products/${product.id}`}
                productImage={imageUrl || undefined}
                price={displayPrice}
              />
            </div> */}
          {/* </div> */}
        </div>
      </Link>

      {/* Product Info */}
      <Link href={`/products/${product.id}`} className="group block" suppressHydrationWarning>
        <div className="space-y-1">
          {/* Category */}
          <p className="micro-label">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="text-body font-medium group-hover:text-brand-gray transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <Price
            price={displayPrice}
            originalPrice={hasDiscount ? product.price : undefined}
            className="text-base"
          />
        </div>
      </Link>
    </div>
  );
}
