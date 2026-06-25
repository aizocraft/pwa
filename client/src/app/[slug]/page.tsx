// src/app/[slug]/page.tsx
import { getProduct } from '../../lib/api';
import ProductDetailClient from './ProductDetailClient';
import ProductSchema from '@/components/ProductSchema';
import type { Metadata } from 'next';

// Generate metadata with full SEO optimization
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  let product = null;
  
  try {
    product = await getProduct(params.slug);
  } catch (error) {
    console.error('Failed to fetch product for metadata:', error);
    product = null;
  }

  // Return 404 metadata if product not found
  if (!product) {
    return {
      title: 'Product Not Found | Plasma Water Africa',
      description: 'The requested product is not available. Browse our collection of high-quality solar products.',
      robots: {
        index: false,
        follow: true,
      },
      openGraph: {
        title: 'Product Not Found | Plasma Water Africa',
        description: 'The requested product is not available.',
        siteName: 'Plasma Water Africa',
        locale: 'en_KE',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: 'Product Not Found | Plasma Water Africa',
        description: 'The requested product is not available.',
      },
    };
  }

  // Sanitize description - remove HTML tags and truncate
  const sanitizeDescription = (text: string): string => {
    if (!text) return '';
    const stripped = text.replace(/<[^>]*>/g, '').trim();
    return stripped.length > 160 ? stripped.slice(0, 157) + '...' : stripped;
  };

  // Build SEO title
  const titleParts = [];
  if (product.brand) titleParts.push(product.brand);
  titleParts.push(product.name);
  if (product.type) titleParts.push(product.type);
  titleParts.push('| Plasma Water Africa');
  const title = titleParts.join(' ');

  // Build SEO description
  const description = product.description 
    ? sanitizeDescription(product.description)
    : `Buy ${product.name} in Kenya at the best price. ${product.brand ? `Brand: ${product.brand}. ` : ''}${product.type ? `Type: ${product.type}. ` : ''}Quality solar products with warranty.`;

  // Get image URL for Open Graph
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke';
  const firstImage = product.images?.[0];
  
  const imageUrl = firstImage
    ? firstImage.url
      ? firstImage.url.startsWith('http')
        ? firstImage.url
        : `${baseUrl}${firstImage.url}`
      : firstImage.fileId
        ? `${baseUrl}/api/products/image/${firstImage.fileId}`
        : undefined
    : undefined;

  // Build keywords
  const keywords = [
    product.name,
    product.brand,
    product.type,
    product.category,
    'solar',
    'renewable energy',
    'Kenya',
    'Nairobi',
    ...(product.tags || [])
  ].filter(Boolean).join(', ');

  const canonicalUrl = `${baseUrl}/${product.slug}`;

  return {
    title,
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Plasma Water Africa',
      locale: 'en_KE',
      type: 'website', // ✅ Fixed: changed from 'product' to 'website'
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
          type: 'image/jpeg',
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      site: '@PlasmaWaterKE',
      creator: '@PlasmaWaterKE',
    },
    category: product.category || 'Solar Products',
    applicationName: 'Plasma Water Africa',
    authors: [{ name: 'Plasma Water Africa' }],
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
  };
}

// Server Component - fetches product and renders client component
export default async function ProductPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  let product = null;
  let error = null;
  
  try {
    product = await getProduct(params.slug);
  } catch (err) {
    console.error('Failed to fetch product:', err);
    error = err instanceof Error ? err.message : 'Failed to load product';
  }

  // If product not found, still render the client component with null
  // The client component will show the "Product not found" UI
  return (
    <>
      {/* Add JSON-LD schema markup if product exists */}
      {product && <ProductSchema product={product} />}
      
      {/* Client component handles loading and error states */}
      <ProductDetailClient product={product} />
      
      {/* Add fallback JSON-LD for 404 pages */}
      {!product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Product Not Found',
              description: 'The requested product is not available.',
              url: `https://plasmawater.co.ke/${params.slug}`,
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://plasmawater.co.ke/' },
                  { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://plasmawater.co.ke/products' },
                  { '@type': 'ListItem', position: 3, name: 'Product Not Found' },
                ],
              },
            }),
          }}
        />
      )}
    </>
  );
}