'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState<{[key: number]: boolean}>({});

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const handleImageError = (index: number, url: string) => {
    console.error(`Failed to load image ${index + 1}:`, url);
    setImageError(prev => ({...prev, [index]: true}));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {imageError[activeIndex] ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400 text-sm">Image not available</span>
          </div>
        ) : (
          <img
            src={images[activeIndex]}
            alt={`${productName} - Image ${activeIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => handleImageError(activeIndex, images[activeIndex])}
            onLoad={() => console.log(`✓ Main image loaded:`, images[activeIndex])}
          />
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative w-16 h-20 flex-shrink-0 overflow-hidden border transition-all ${
                index === activeIndex ? 'border-black border-2' : 'border-gray-200'
              }`}
            >
              {imageError[index] ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => handleImageError(index, image)}
                  onLoad={() => console.log(`✓ Thumbnail ${index} loaded:`, image)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
