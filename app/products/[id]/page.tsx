'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Product } from '@/lib/types/api';
import { getProductById } from '@/lib/api/catalog';
import { useCartStore } from '@/lib/store/cart';
import ImageGallery from '../../components/product/ImageGallery';
import ShareButton from '../../components/product/ShareButton';
import SizeSelector from '../../components/product/SizeSelector';
import { Skeleton } from '../../components/ui/Skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legomenswear.com';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(productId);
        setProduct(data);

        // Auto-select first size and color if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    // Validate size selection if sizes are available
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    // Validate color selection if colors are available
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    setAddingToCart(true);

    const displayPrice = product.discountedPrice && product.discountedPrice > 0
      ? product.discountedPrice
      : product.price;

    // Use backend-provided shareUrl if available, otherwise build it
    const shareUrl = product.shareUrl || 
      (typeof window !== 'undefined'
        ? `${window.location.origin}/products/${product.id}`
        : `/products/${product.id}`);

    // Add items one by one based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        unitPrice: displayPrice,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
        image: product.primaryImage || product.imagePaths[0],
        category: product.category,
        shareUrl: shareUrl,
      });
    }

    // Show success feedback and reset
    setTimeout(() => {
      setAddingToCart(false);
      setAddedToCart(true);
      // Reset quantity to 1 after adding
      setQuantity(1);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button 
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = product.discountedPrice && product.discountedPrice > 0
    ? product.discountedPrice
    : product.price;
  
  const hasDiscount = product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price;

  // Generate JSON-LD Product Schema
  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imagePaths,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: 'USD',
      price: displayPrice.toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      inventoryLevel: {
        '@type': 'QuantitativeValue',
        value: product.quantity,
      },
    },
    sku: product.barcode,
    category: product.category,
    ...{
      ...(hasDiscount && {
        priceCurrency: 'USD',
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    },
  } : null;

  return (
    <>
      {product && productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-0 md:gap-12">
          {/* Left Column - Images */}
          <div className="md:sticky md:top-20 h-fit px-4 md:px-6 py-6">
            <ImageGallery images={product.imagePaths} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="px-4 md:px-6 py-6 space-y-8">
            {/* Product Title & Brand */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-semibold ${hasDiscount ? 'text-red-600' : 'text-black'}`}>
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium">
                      -{Math.round(((product.price - (product.discountedPrice || 0)) / product.price) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                sizeQuantities={product.sizeQuantities}
              />
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">SELECT COLOR</span>
                  {selectedColor && (
                    <span className="text-sm text-gray-500">Selected: {selectedColor}</span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm border transition-all ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">QUANTITY</span>
                <span className="text-sm text-gray-500">
                  {product.quantity} in stock
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  −
                </button>
                <div className="px-6 py-2 border border-gray-300 min-w-[60px] text-center font-medium">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  disabled={quantity >= product.quantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className={`p-4 border ${product.inStock ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">In Stock - Ready to Ship</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-700">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addingToCart || addedToCart}
                className={`flex-1 py-4 font-medium text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  addedToCart 
                    ? 'bg-green-600 text-white' 
                    : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed'
                }`}
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>ADDING...</span>
                  </>
                ) : addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>ADDED TO BAG!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>ADD TO BAG</span>
                  </>
                )}
              </button>

              {/* Share Button */}
              <ShareButton
                productName={product.name}
                productUrl={`/products/${product.id}`}
                productImage={product.primaryImage || product.imagePaths[0]}
                price={displayPrice}
              />
            </div>

            <div className="border-t border-gray-200" />

            {/* Product Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium">PRODUCT DETAILS</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                {product.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subcategory</span>
                    <span className="font-medium">{product.subcategory}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
                {product.barcode && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product Code</span>
                    <span className="font-medium">{product.barcode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Material</span>
                  <span className="font-medium">100% Premium Cotton</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Care Instructions</span>
                  <span className="font-medium">Machine wash cold</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium">DESCRIPTION</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating View Cart Button - appears after adding to cart */}
      {addedToCart && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <Link
            href="/cart"
            className="flex items-center gap-3 bg-white border-2 border-black px-6 py-3 shadow-lg hover:bg-black hover:text-white transition-all group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-medium text-sm uppercase tracking-wider">View Cart</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
    </>
  );
}
