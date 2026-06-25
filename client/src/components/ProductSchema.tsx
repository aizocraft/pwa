// src/components/ProductSchema.tsx
'use client'

import { Product } from '@/types/product';

interface ProductSchemaProps {
  product: Product;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke';
  
  // Safely get image URL
  const getImageUrl = () => {
    if (!product.images?.[0]) return undefined;
    
    const img = product.images[0];
    if (img.url) {
      return img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`;
    }
    if (img.fileId) {
      return `${baseUrl}/api/products/image/${img.fileId}`;
    }
    return undefined;
  };

  const imageUrl = getImageUrl();

  // Safely get description
  const getDescription = () => {
    if (!product.description) return '';
    return product.description.replace(/<[^>]*>/g, '').substring(0, 500);
  };

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name || 'Product',
    description: getDescription(),
    sku: product.sku || '',
    mpn: product.sku || '',
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Plasma Water Africa',
    },
    category: product.category || 'Solar Products',
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/${product.slug || ''}`,
      priceCurrency: 'KES',
      price: product.price || 0,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
    aggregateRating: (product.rating || 0) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 0,
      reviewCount: Math.floor((product.rating || 0) * 5),
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}