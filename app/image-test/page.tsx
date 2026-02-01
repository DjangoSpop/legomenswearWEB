'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '../components/ui/Button';

export default function ImageTestPage() {
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageTests, setImageTests] = useState<Record<string, string>>({});

  const API_BASE = 'https://lego-menswear-backend-abf196114bd9.herokuapp.com';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/products/`);
      const data = await response.json();

      console.log('Raw API Response:', data);
      setRawResponse(data);

      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testImageUrl = async (url: string, productId: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const status = response.ok ? '✅ OK' : `❌ ${response.status}`;
      setImageTests((prev) => ({ ...prev, [productId]: status }));
      return response.ok;
    } catch (error) {
      setImageTests((prev) => ({ ...prev, [productId]: `❌ Error: ${error}` }));
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container-page py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-2">Image Loading Test</h1>
            <p className="text-brand-gray">Diagnose image loading issues</p>
          </div>
          <Button onClick={fetchProducts} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Backend Response Structure */}
        {rawResponse && (
          <div className="mb-8 card p-6">
            <h2 className="text-xl font-medium mb-4">Backend Response Structure</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Response Type</h3>
                <code className="text-xs bg-brand-offwhite p-3 block rounded">
                  {Array.isArray(rawResponse) ? 'Array' : typeof rawResponse}
                </code>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Product Count</h3>
                <code className="text-xs bg-brand-offwhite p-3 block rounded">
                  {Array.isArray(rawResponse) ? rawResponse.length : 'N/A'}
                </code>
              </div>
            </div>

            {Array.isArray(rawResponse) && rawResponse.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">First Product Keys</h3>
                <div className="bg-brand-offwhite p-4 rounded">
                  <code className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(Object.keys(rawResponse[0]), null, 2)}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Images Test */}
        {products.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Products & Images</h2>

            {products.map((product, index) => {
              const hasImagePaths = product.imagePaths && Array.isArray(product.imagePaths);
              const hasImages = product.images && Array.isArray(product.images);
              const imagePathsCount = hasImagePaths ? product.imagePaths.length : 0;
              const imagesCount = hasImages ? product.images.length : 0;

              return (
                <div key={product.id || index} className="card p-6">
                  <div className="flex items-start gap-6">
                    {/* Image Preview */}
                    <div className="w-48 flex-shrink-0">
                      {hasImagePaths && product.imagePaths[0] ? (
                        <div>
                          <div className="relative aspect-product bg-brand-lightgray mb-2 overflow-hidden">
                            <Image
                              src={product.imagePaths[0]}
                              alt={product.name || 'Product'}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                console.error('Image error:', product.imagePaths[0]);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <p className="text-xs text-green-600">✓ Using imagePaths</p>
                        </div>
                      ) : hasImages && product.images[0]?.image ? (
                        <div>
                          <div className="relative aspect-product bg-brand-lightgray mb-2 overflow-hidden">
                            <Image
                              src={product.images[0].image}
                              alt={product.name || 'Product'}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                console.error('Image error:', product.images[0].image);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <p className="text-xs text-blue-600">✓ Using images array</p>
                        </div>
                      ) : (
                        <div className="aspect-product bg-brand-lightgray flex items-center justify-center">
                          <p className="text-sm text-brand-gray">No Image</p>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">{product.name || 'Unnamed Product'}</h3>

                      {/* Image Data Analysis */}
                      <div className="space-y-3 text-sm">
                        {/* imagePaths Field */}
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">imagePaths (camelCase)</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                hasImagePaths
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {hasImagePaths ? `${imagePathsCount} images` : 'Not present'}
                            </span>
                          </div>
                          {hasImagePaths ? (
                            <div className="space-y-1">
                              {product.imagePaths.map((url: string, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-xs text-gray-500">[{i}]</span>
                                  <div className="flex-1">
                                    <code className="text-xs bg-white p-1 block break-all">
                                      {url}
                                    </code>
                                    <Button
                                      variant="outline"
                                      onClick={() => testImageUrl(url, `${product.id}-${i}`)}
                                      className="mt-1 !py-1 !px-2 !text-xs"
                                    >
                                      Test URL
                                    </Button>
                                    {imageTests[`${product.id}-${i}`] && (
                                      <span className="ml-2 text-xs">
                                        {imageTests[`${product.id}-${i}`]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Backend did not send imagePaths</p>
                          )}
                        </div>

                        {/* images Field */}
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">images (snake_case)</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                hasImages ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {hasImages ? `${imagesCount} images` : 'Not present'}
                            </span>
                          </div>
                          {hasImages ? (
                            <div className="space-y-1">
                              {product.images.map((img: any, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-xs text-gray-500">[{i}]</span>
                                  <code className="text-xs bg-white p-1 block break-all flex-1">
                                    {img.image || JSON.stringify(img)}
                                  </code>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Backend did not send images array</p>
                          )}
                        </div>

                        {/* Other Fields */}
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                          <p className="font-medium mb-2">Other Product Fields</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">inStock:</span>{' '}
                              <code>{String(product.inStock)}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">in_stock:</span>{' '}
                              <code>{String(product.in_stock)}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">discountedPrice:</span>{' '}
                              <code>{product.discountedPrice}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">discounted_price:</span>{' '}
                              <code>{product.discounted_price}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">reviewCount:</span>{' '}
                              <code>{product.reviewCount}</code>
                            </div>
                            <div>
                              <span className="text-gray-500">review_count:</span>{' '}
                              <code>{product.review_count}</code>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full JSON */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-brand-gray hover:text-brand-black">
                          Show full product JSON
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                          {JSON.stringify(product, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 text-brand-gray">
            No products found. Click refresh to load.
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 card p-6">
          <h3 className="font-medium mb-4">How to Use This Tool</h3>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Check if backend sends <code>imagePaths</code> (camelCase) or <code>images</code> (snake_case)</li>
            <li>Verify image URLs are absolute (start with https://)</li>
            <li>Click "Test URL" to check if image is accessible</li>
            <li>Compare fields to see if backend sends camelCase or snake_case</li>
            <li>Check full JSON to debug any issues</li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm">
              <strong>Expected:</strong> Backend should send <code>imagePaths</code> as an array of
              absolute URLs like:
              <br />
              <code className="text-xs">
                ["https://lego-menswear-backend...herokuapp.com/media/products/image.jpg"]
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
