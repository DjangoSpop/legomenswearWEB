import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legomenswear.com';
const brandName = 'LEGO Menswear';
const brandDescription = 'Discover premium menswear designed for the modern gentleman. Quality, style, and comfort in every piece. Shop the latest collection of men\'s clothing, shoes, and accessories at LEGO Menswear Store.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'LEGO Menswear - Premium Men\'s Clothing & Fashion',
    template: '%s | LEGO Menswear',
  },
  description: brandDescription,
  keywords: [
    'mens wear',
    'mens clothing',
    'mens fashion',
    'premium menswear',
    'mens shoes',
    'mens accessories',
    'LEGO menswear',
    'fashion for men',
  ],
  authors: [{ name: 'LEGO Menswear' }],
  creator: 'LEGO Menswear',
  publisher: 'LEGO Menswear',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  // OpenGraph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: brandName,
    title: 'LEGO Menswear - Premium Men\'s Clothing & Fashion',
    description: brandDescription,
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'LEGO Menswear - Premium Menswear Store',
        type: 'image/jpeg',
      },
    ],
  },
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'LEGO Menswear - Premium Men\'s Clothing & Fashion',
    description: brandDescription,
    images: [`${baseUrl}/og-image.jpg`],
    creator: '@LEGOMenswear',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'en-US': `${baseUrl}/en-US`,
      'en': baseUrl,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon (cache-busted and multiple rels for compatibility) */}
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/lego_menswear_logo.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/lego_menswear_logo.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* DNS Prefetch for backend API */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} />
        
        {/* Mobile Web App */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LEGO Menswear" />
        
        {/* JSON-LD Schema for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: brandName,
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              description: brandDescription,
              sameAs: [
                'https://www.facebook.com/LEGOMenswear',
                'https://www.twitter.com/LEGOMenswear',
                'https://www.instagram.com/LEGOMenswear',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Support',
                email: 'support@legomenswear.com',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
