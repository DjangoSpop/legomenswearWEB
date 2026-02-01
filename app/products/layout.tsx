import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legomenswear.com';

export const metadata: Metadata = {
  title: 'All Products - Shop Men\'s Clothing & Accessories',
  description: 'Browse our complete collection of premium menswear including clothing, shoes, and accessories. Find your perfect style at LEGO Menswear.',
  openGraph: {
    type: 'website',
    url: `${baseUrl}/products`,
    title: 'Shop All Products - LEGO Menswear',
    description: 'Discover our complete collection of premium menswear.',
    siteName: 'LEGO Menswear',
    images: [
      {
        url: `${baseUrl}/og-products.jpg`,
        width: 1200,
        height: 630,
        alt: 'LEGO Menswear Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop All Products - LEGO Menswear',
    description: 'Discover our complete collection of premium menswear.',
    images: [`${baseUrl}/og-products.jpg`],
  },
  alternates: {
    canonical: `${baseUrl}/products`,
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
