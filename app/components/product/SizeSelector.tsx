'use client';

import React from 'react';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  sizeQuantities?: Record<string, number> | null;
  disabled?: boolean;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  sizeQuantities,
  disabled = false,
}: SizeSelectorProps) {
  const isSizeAvailable = (size: string): boolean => {
    if (!sizeQuantities) return true;
    return (sizeQuantities[size] || 0) > 0;
  };

  const getSizeQuantity = (size: string): number => {
    if (!sizeQuantities) return 0;
    return sizeQuantities[size] || 0;
  };

  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Size Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 uppercase tracking-wide">
          Select Size
        </label>
        {selectedSize && (
          <span className="text-xs text-gray-500 font-medium">
            Selected: {selectedSize}
          </span>
        )}
      </div>

      {/* Size Grid */}
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isAvailable = isSizeAvailable(size);
          const quantity = getSizeQuantity(size);
          const isLowStock = quantity > 0 && quantity <= 3;

          return (
            <button
              key={size}
              type="button"
              onClick={() => {
                if (!disabled && isAvailable) {
                  onSizeChange(size);
                }
              }}
              disabled={disabled || !isAvailable}
              className={`
                relative px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200
                border rounded-md
                ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : isAvailable
                    ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-900 active:scale-95'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }
                ${!isAvailable && 'relative overflow-hidden'}
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Size Label */}
              <span className={isAvailable ? '' : 'opacity-50'}>{size}</span>

              {/* Diagonal Line for Out of Stock */}
              {!isAvailable && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-px bg-gray-300 rotate-45 origin-center" />
                </span>
              )}

              {/* Low Stock Indicator */}
              {isAvailable && isLowStock && !isSelected && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Size Guide Link */}
      <button
        type="button"
        className="text-xs text-gray-600 underline hover:text-gray-900 transition-colors"
        onClick={() => {
          // This would open a size guide modal
          console.log('Open size guide');
        }}
      >
        Size Guide
      </button>

      {/* Helper Text */}
      {selectedSize && sizeQuantities && (
        <p className="text-xs text-gray-500">
          {getSizeQuantity(selectedSize) <= 3 ? (
            <span className="text-orange-600 font-medium">
              Only {getSizeQuantity(selectedSize)} left in {selectedSize}
            </span>
          ) : (
            <span>Size {selectedSize} is in stock</span>
          )}
        </p>
      )}
    </div>
  );
}

// Utility function to determine size type and return appropriate sizes
export const getSizesForCategory = (category: string, subcategory?: string): string[] => {
  const normalizedCategory = category.toLowerCase();
  const normalizedSubcategory = subcategory?.toLowerCase();

  // Pants & Jeans → Numeric sizes
  if (
    normalizedCategory === 'pants' ||
    normalizedCategory === 'jeans' ||
    normalizedSubcategory === 'pants' ||
    normalizedSubcategory === 'jeans'
  ) {
    return ['28', '30', '32', '34', '36', '38', '40', '42'];
  }

  // Tops (Shirts, T-Shirts, Jackets, Hoodies) → Alpha sizes
  if (
    normalizedCategory === 'tops' ||
    normalizedSubcategory === 't-shirts' ||
    normalizedSubcategory === 'shirts' ||
    normalizedSubcategory === 'jackets' ||
    normalizedSubcategory === 'hoodies' ||
    normalizedSubcategory === 'sweaters'
  ) {
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }

  // Shoes → Numeric sizes (different range)
  if (normalizedCategory === 'shoes' || normalizedSubcategory === 'shoes') {
    return ['7', '8', '9', '10', '11', '12', '13'];
  }

  // Default → Alpha sizes
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
};
