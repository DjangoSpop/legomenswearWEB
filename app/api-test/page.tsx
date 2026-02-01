'use client';

import { useState } from 'react';
import Button from '../components/ui/Button';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'https://lego-menswear-backend-abf196114bd9.herokuapp.com';

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      setTestResults(prev => [...prev, {
        name,
        status: 'success',
        result,
        duration: `${duration}ms`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setTestResults(prev => [...prev, {
        name,
        status: 'error',
        error: error.message,
        fullError: error,
        duration: `${duration}ms`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      throw error;
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    setLoading(true);

    try {
      // Test 1: Direct fetch to API
      await runTest('Direct Fetch (Native)', async () => {
        const response = await fetch(`${API_BASE}/api/products/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          status: response.status,
          dataType: Array.isArray(data) ? 'array' : typeof data,
          count: Array.isArray(data) ? data.length : 0,
          sample: Array.isArray(data) && data.length > 0 ? data[0] : null,
        };
      });

      // Test 2: Using axios from API client
      await runTest('Using Axios Client', async () => {
        const { default: axios } = await import('axios');
        const response = await axios.get(`${API_BASE}/api/products/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return {
          status: response.status,
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          count: Array.isArray(response.data) ? response.data.length : 0,
          sample: Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null,
        };
      });

      // Test 3: Using our API client
      await runTest('Using App API Client', async () => {
        const { getProducts } = await import('@/lib/api/catalog');
        const products = await getProducts();

        return {
          dataType: Array.isArray(products) ? 'array' : typeof products,
          count: Array.isArray(products) ? products.length : 0,
          sample: Array.isArray(products) && products.length > 0 ? products[0] : null,
        };
      });

      // Test 4: Check single product
      await runTest('Fetch Single Product', async () => {
        const response = await fetch(`${API_BASE}/api/products/`);
        const products = await response.json();

        if (!Array.isArray(products) || products.length === 0) {
          throw new Error('No products to test with');
        }

        const firstProductId = products[0].id;
        const productResponse = await fetch(`${API_BASE}/api/products/${firstProductId}/`);

        if (!productResponse.ok) {
          throw new Error(`HTTP ${productResponse.status}`);
        }

        const product = await productResponse.json();

        return {
          id: product.id,
          name: product.name,
          hasImages: product.images && product.images.length > 0,
          imageCount: product.images ? product.images.length : 0,
        };
      });

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light tracking-tight mb-4">API Connection Test</h1>
        <p className="text-brand-gray mb-8">
          Test the connection to your backend API: {API_BASE}
        </p>

        <Button
          variant="primary"
          onClick={runAllTests}
          loading={loading}
          disabled={loading}
        >
          Run All Tests
        </Button>

        {testResults.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-medium">Test Results</h2>

            {testResults.map((result, index) => (
              <div
                key={index}
                className={`card p-6 ${
                  result.status === 'success'
                    ? 'border-green-500'
                    : 'border-accent-red'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{result.name}</h3>
                    <p className="text-caption text-brand-gray">
                      {result.timestamp} • {result.duration}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs uppercase tracking-wider ${
                      result.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>

                {result.status === 'success' ? (
                  <pre className="text-xs bg-brand-offwhite p-4 overflow-auto rounded">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                ) : (
                  <div>
                    <p className="text-accent-red mb-2">{result.error}</p>
                    <details>
                      <summary className="cursor-pointer text-caption text-brand-gray">
                        Full error details
                      </summary>
                      <pre className="text-xs bg-brand-offwhite p-4 overflow-auto rounded mt-2">
                        {JSON.stringify(result.fullError, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 card p-6">
          <h3 className="font-medium mb-4">Environment Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-gray">API Base URL:</span>
              <code className="text-xs bg-brand-offwhite px-2 py-1">
                {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray">Node Env:</span>
              <code className="text-xs bg-brand-offwhite px-2 py-1">
                {process.env.NODE_ENV}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray">Browser:</span>
              <code className="text-xs bg-brand-offwhite px-2 py-1">
                {typeof window !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'SSR'}
              </code>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded">
          <h3 className="font-medium mb-2">Manual Test</h3>
          <p className="text-sm text-brand-gray mb-4">
            Open browser console and run:
          </p>
          <code className="block text-xs bg-white p-4 rounded border overflow-x-auto">
            {`fetch('${API_BASE}/api/products/').then(r => r.json()).then(console.log)`}
          </code>
        </div>
      </div>
    </div>
  );
}
