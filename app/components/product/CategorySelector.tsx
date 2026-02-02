'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Category {
  id: string;
  label: string;
  value: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [categories]);

  return (
    <div className="relative bg-white border-b border-gray-100">
      {/* Left Fade */}
      {showLeftGradient && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Category Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.value;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              className={`
                relative flex-shrink-0 px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200
                ${
                  isSelected
                    ? 'text-black'
                    : 'text-gray-500 hover:text-gray-900 active:text-black'
                }
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Text */}
              <span className={isSelected ? 'font-semibold' : 'font-normal'}>
                {category.label}
              </span>

              {/* Active Underline */}
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Fade */}
      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Hide scrollbar globally for this container */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Predefined Men's Wear Categories
export const MENS_WEAR_CATEGORIES: Category[] = [
  { id: 'all', label: 'All', value: '' },
  { id: 'jackets', label: 'Jackets', value: 'jackets' },
  { id: 'tshirts', label: 'T-Shirts', value: 't-shirts' },
  { id: 'shirts', label: 'Shirts', value: 'shirts' },
  { id: 'pants', label: 'Pants', value: 'pants' },
  { id: 'jeans', label: 'Jeans', value: 'jeans' },
  { id: 'hoodies', label: 'Hoodies', value: 'hoodies' },
  { id: 'accessories', label: 'Accessories', value: 'accessories' },
];
