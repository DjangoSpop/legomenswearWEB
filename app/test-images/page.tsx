'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TestImagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          'https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/products/'
        );
        const data = await response.json();

        console.log('========= RAW API RESPONSE =========');
        console.log('Full response:', data);
        console.log('Is array?', Array.isArray(data));
        console.log('Count:', data.length);

        if (data.length > 0) {
          console.log('========= FIRST PRODUCT =========');
          console.log('Full product:', data[0]);
          console.log('Product name:', data[0].name);
          console.log('imagePaths field:', data[0].imagePaths);
          console.log('images field:', data[0].images);
          console.log('All keys:', Object.keys(data[0]));
        }

        setProducts(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="container-page py-12">Loading...</div>;
  if (error) return <div className="container-page py-12 text-red-600">Error: {error}</div>;

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>

      <div className="mb-8 bg-yellow-100 border border-yellow-400 p-4 rounded">
        <p className="font-bold">Check Browser Console (F12) for detailed logs!</p>
      </div>

      <div className="space-y-8">
        {products.map((product, index) => (
          <div key={product.id || index} className="border border-gray-300 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

            {/* Show what backend sent */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-bold mb-2">imagePaths (camelCase):</h3>
                <pre className="text-xs overflow-auto bg-white p-2 rounded">
                  {JSON.stringify(product.imagePaths, null, 2)}
                </pre>
                {product.imagePaths && Array.isArray(product.imagePaths) && (
                  <p className="text-green-600 mt-2">
                    ✓ Found {product.imagePaths.length} images
                  </p>
                )}
              </div>

              <div className="bg-purple-50 p-4 rounded">
                <h3 className="font-bold mb-2">images (snake_case):</h3>
                <pre className="text-xs overflow-auto bg-white p-2 rounded">
                  {JSON.stringify(product.images, null, 2)}
                </pre>
              </div>
            </div>

            {/* Try to display images */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-4">Attempting to Load Images:</h3>

              {/* Method 1: From imagePaths */}
              {product.imagePaths && Array.isArray(product.imagePaths) && product.imagePaths.length > 0 && (
                <div className="mb-6">
                  <p className="text-green-600 font-bold mb-2">
                    ✓ Method 1: Using imagePaths (camelCase)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.imagePaths.map((url: string, i: number) => (
                      <div key={i} className="border border-gray-300 rounded overflow-hidden">
                        <div className="relative w-full h-48 bg-gray-100">
                          <Image
                            src={url}
                            alt={`${product.name} - Image ${i + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              console.error(`Image ${i} failed to load:`, url);
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="flex items-center justify-center h-full text-red-600 text-xs p-2">Failed to load</div>`;
                              }
                            }}
                            onLoad={() => {
                              console.log(`✓ Image ${i} loaded successfully:`, url);
                            }}
                          />
                        </div>
                        <div className="p-2 bg-gray-50 text-xs break-all">
                          {url}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Method 2: From images array */}
              {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                <div className="mb-6">
                  <p className="text-blue-600 font-bold mb-2">
                    ✓ Method 2: Using images array (snake_case)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.images.map((img: any, i: number) => (
                      <div key={i} className="border border-gray-300 rounded overflow-hidden">
                        <div className="relative w-full h-48 bg-gray-100">
                          <Image
                            src={img.image}
                            alt={`${product.name} - Image ${i + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              console.error(`Image ${i} failed to load:`, img.image);
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="flex items-center justify-center h-full text-red-600 text-xs p-2">Failed to load</div>`;
                              }
                            }}
                            onLoad={() => {
                              console.log(`✓ Image ${i} loaded successfully:`, img.image);
                            }}
                          />
                        </div>
                        <div className="p-2 bg-gray-50 text-xs break-all">
                          {img.image}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Method 3: Direct img tag test */}
              {product.imagePaths && product.imagePaths[0] && (
                <div className="mt-6 bg-green-50 p-4 rounded">
                  <p className="font-bold mb-2">Method 3: Direct HTML img tag (bypass Next.js)</p>
                  <img
                    src={product.imagePaths[0]}
                    alt={product.name}
                    className="max-w-xs"
                    onError={(e) => {
                      console.error('HTML img tag failed:', product.imagePaths[0]);
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const div = document.createElement('div');
                        div.className = 'text-red-600 font-bold';
                        div.textContent = `❌ Image failed to load with HTML img tag. URL: ${product.imagePaths[0]}`;
                        parent.appendChild(div);
                      }
                    }}
                    onLoad={() => {
                      console.log('✓ HTML img tag loaded successfully:', product.imagePaths[0]);
                    }}
                  />
                </div>
              )}

              {!product.imagePaths && !product.images && (
                <p className="text-red-600">❌ No image data found in backend response</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-100 p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Debugging Checklist:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check browser console (F12) for detailed logs</li>
          <li>Look for "imagePaths" or "images" field in response</li>
          <li>Verify URLs start with "https://"</li>
          <li>Try opening image URL directly in new tab</li>
          <li>Check if CORS headers allow loading</li>
          <li>Verify Next.js image config in next.config.mjs</li>
        </ol>
      </div>
    </div>
  );
}
