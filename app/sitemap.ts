import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legomenswear.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products?category=Men`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products?category=Women`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products?category=Kids`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products?category=Shoes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products?category=Accessories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.5,
    },
  ];

  // Dynamic product pages would be fetched from your API
  // For now, we return static pages and add a note
  // In production, you'd fetch all products from your API

  try {
    // Attempt to fetch products from your API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/products/`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (response.ok) {
      const products = await response.json();

      const productPages: MetadataRoute.Sitemap = products
        .slice(0, 10000) // Google Sitemap limit
        .map((product: any) => ({
          url: `${baseUrl}/products/${product.id}`,
          lastModified: new Date(product.updated_at || product.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));

      return [...staticPages, ...productPages];
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    // Fallback to static pages if API fails
  }

  return staticPages;
}
