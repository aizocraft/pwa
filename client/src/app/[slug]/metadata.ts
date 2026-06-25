// src/app/[slug]/metadata.ts
import type { Metadata } from 'next';
import { getProduct } from '../../lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let product;

  try {
    product = await getProduct(params.slug);
  } catch (error) {
    product = null;
  }

  if (!product) {
    return {
      title: 'Product Not Found | Plasma Water Africa',
      description: 'The requested product is not available. Browse our collection of high-quality solar products.',
      robots: 'noindex, follow',
      openGraph: {
        title: 'Product Not Found | Plasma Water Africa',
        description: 'The requested product is not available.',
      },
    };
  }

  // Build SEO title with brand and type
  const titleParts = [];
  if (product.brand) titleParts.push(product.brand);
  titleParts.push(product.name);
  if (product.type) titleParts.push(product.type);
  titleParts.push('| Plasma Water Africa');
  const title = titleParts.join(' ');

  // Build SEO description
  const description = product.description 
    ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
    : `Buy ${product.name} in Kenya at the best price. ${product.brand ? `Brand: ${product.brand}. ` : ''}${product.type ? `Type: ${product.type}. ` : ''}Quality solar products with warranty.`;

  // Get image URL for OG
  const firstImage = product.images?.[0];
  const imageUrl = firstImage
    ? firstImage.url
      ? firstImage.url.startsWith('http')
        ? firstImage.url
        : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke'}${firstImage.url}`
      : firstImage.fileId
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke'}/api/products/image/${firstImage.fileId}`
        : undefined
    : undefined;

  // Keywords
  const keywords = [
    product.name,
    product.brand,
    product.type,
    product.category,
    'solar',
    'renewable energy',
    'Kenya',
    ...(product.tags || [])
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    robots: 'index, follow',
    alternates: {
      canonical: `https://plasmawater.co.ke/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://plasmawater.co.ke/${product.slug}`,
      siteName: 'Plasma Water Africa',
      locale: 'en_KE',
      type: 'website',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      site: '@PlasmaWaterKE',
    },
    category: product.category || 'Solar Products',
  };
}