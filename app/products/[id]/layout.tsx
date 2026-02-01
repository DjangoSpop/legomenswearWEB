import type { Metadata } from 'next';
import { getProductById } from '@/lib/api/catalog';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legomenswear.com';

interface ProductDetailLayoutProps {
  params: {
    id: string;
  };
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: Omit<ProductDetailLayoutProps, 'children'>): Promise<Metadata> {
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return {
        title: 'Product Not Found - LEGO Menswear',
        description: 'The product you are looking for is not available.',
      };
    }

    const displayPrice = product.discountedPrice && product.discountedPrice > 0
      ? product.discountedPrice
      : product.price;

    const productImage = product.primaryImage || (product.imagePaths && product.imagePaths[0]) || `${baseUrl}/placeholder.jpg`;
    const productUrl = `${baseUrl}/products/${product.id}`;

    return {
      title: `${product.name} - ${product.brand || 'LEGO Menswear'} | Shop Now`,
      description: product.description || `Shop ${product.name} at LEGO Menswear. Premium ${product.category} for men. ${product.inStock ? 'In stock' : 'Currently unavailable'}.`,
      keywords: [
        product.name,
        product.brand || 'LEGO',
        product.category,
        ...(product.subcategory ? [product.subcategory] : []),
        'mens wear',
        'premium menswear',
      ],
      openGraph: {
        type: 'website',
        url: productUrl,
        title: `${product.name} - LEGO Menswear`,
        description: product.description || `Shop ${product.name} at LEGO Menswear`,
        images: [
          {
            url: productImage,
            width: 800,
            height: 1000,
            alt: product.name,
            type: 'image/jpeg',
          },
        ],
        siteName: 'LEGO Menswear',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - LEGO Menswear`,
        description: product.description || `Shop ${product.name} at LEGO Menswear`,
        images: [productImage],
        creator: '@LEGOMenswear',
      },
      alternates: {
        canonical: productUrl,
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product - LEGO Menswear',
      description: 'View product details at LEGO Menswear.',
    };
  }
}

export default function ProductDetailLayout({
  children,
}: ProductDetailLayoutProps) {
  return children;
}
