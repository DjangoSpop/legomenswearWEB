'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types/api';
import { getProducts } from '@/lib/api/catalog';
import Button from '../components/ui/Button';

export default function StockCheckPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Get transformed products
      const transformedProducts = await getProducts();
      setProducts(transformedProducts);

      // Also fetch raw data directly to compare
      const response = await fetch(
        'https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/products/'
      );
      const raw = await response.json();
      setRawData(raw);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="container-page py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-2">
              Stock Status Check
            </h1>
            <p className="text-brand-gray">
              Compare backend data vs frontend transformation
            </p>
          </div>
          <Button onClick={loadProducts} loading={loading}>
            Refresh Data
          </Button>
        </div>

        {products.length > 0 && (
          <div className="space-y-6">
            {products.map((product, index) => {
              const rawProduct = rawData[index];

              return (
                <div key={product.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-medium mb-1">{product.name}</h3>
                      <p className="text-caption text-brand-gray">ID: {product.id}</p>
                    </div>

                    {/* Stock Status Badge */}
                    <div
                      className={`px-4 py-2 text-sm font-medium ${
                        product.inStock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.inStock ? '✓ IN STOCK' : '✗ OUT OF STOCK'}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Backend Raw Data */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Backend Raw Data
                      </h4>
                      <div className="bg-blue-50 p-4 rounded space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">in_stock:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {rawProduct?.in_stock !== undefined
                              ? String(rawProduct.in_stock)
                              : 'undefined'}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">quantity:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {rawProduct?.quantity ?? 'undefined'}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">price:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {rawProduct?.price}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">images:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {rawProduct?.images
                              ? `${rawProduct.images.length} images`
                              : 'undefined'}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Frontend Transformed Data */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Frontend Transformed
                      </h4>
                      <div className="bg-green-50 p-4 rounded space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">inStock:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {String(product.inStock)}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">quantity:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {product.quantity}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">price:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            ${product.price.toFixed(2)}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">imagePaths:</span>
                          <code className="bg-white px-2 py-1 rounded">
                            {product.imagePaths.length} images
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logic Explanation */}
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <h4 className="text-sm font-medium mb-2">Stock Logic Applied:</h4>
                    <p className="text-sm text-gray-700">
                      {rawProduct?.in_stock !== undefined && rawProduct?.in_stock !== null ? (
                        <>
                          ✓ Backend explicitly set <code>in_stock = {String(rawProduct.in_stock)}</code>
                          , using that value.
                        </>
                      ) : rawProduct?.quantity !== undefined && rawProduct?.quantity !== null ? (
                        <>
                          ⚠ Backend didn't set <code>in_stock</code>, checking quantity:{' '}
                          <code>quantity = {rawProduct.quantity}</code> →{' '}
                          <code>inStock = {rawProduct.quantity > 0 ? 'true' : 'false'}</code>
                        </>
                      ) : (
                        <>
                          ℹ No stock data from backend, defaulting to <code>inStock = true</code>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Product Details */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-brand-gray hover:text-brand-black">
                      Show full product data
                    </summary>
                    <div className="mt-2 grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs uppercase tracking-wider text-brand-gray mb-2">
                          Raw Backend
                        </h5>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                          {JSON.stringify(rawProduct, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-xs uppercase tracking-wider text-brand-gray mb-2">
                          Transformed Frontend
                        </h5>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                          {JSON.stringify(product, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
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
        <div className="mt-12 card p-6">
          <h3 className="font-medium mb-4">How Stock Status Works</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1. Explicit stock flag:</strong> If backend sends{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">in_stock: true/false</code>, we use
              that value.
            </p>
            <p>
              <strong>2. Quantity-based:</strong> If <code>in_stock</code> is not set, we check{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">quantity</code>. If quantity {'>'} 0,
              product is in stock.
            </p>
            <p>
              <strong>3. Default:</strong> If neither is available, we default to{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">inStock = true</code> to avoid
              showing products as unavailable by default.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm">
              <strong>💡 Tip:</strong> To manually control stock status, make sure your backend
              explicitly sets the <code>in_stock</code> field when creating/updating products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
