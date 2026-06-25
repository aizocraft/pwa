'use client'

import { Product } from '@/types/product';

interface ProductSchemaProps {
  product: Product;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke';
  const imageUrl = product.images?.[0]
    ? product.images[0].url
      ? product.images[0].url.startsWith('http')
        ? product.images[0].url
        : `${baseUrl}${product.images[0].url}`
      : product.images[0].fileId
        ? `${baseUrl}/api/products/image/${product.images[0].fileId}`
        : undefined
    : undefined;

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, '') || '',
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Plasma Water Africa',
    },
    category: product.category || 'Solar Products',
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/${product.slug}`,
      priceCurrency: 'KES',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Plasma Water Africa',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'KES',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            value: '2',
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            value: '5',
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: product.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: Math.floor(product.rating * 5),
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}