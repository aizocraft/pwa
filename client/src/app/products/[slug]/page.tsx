// app/products/[slug]/page.tsx
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { getProduct } from '../../../lib/api';

// Generate metadata dynamically based on product
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const product = await getProduct(slug);
    
    if (!product) {
      return {
        title: 'Product Not Found | Plasma Water Africa',
        description: 'The requested product could not be found.',
      };
    }
    
    const productName = product.name;
    const productDescription = product.description || `Premium ${productName} available at Plasma Water Africa. Best quality and competitive prices.`;
    const productPrice = product.price;
    const productImage = product.images?.[0]?.url || product.images?.[0]?.fileId;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const imageUrl = productImage ? `${baseUrl}/api/products/image/${productImage}` : '/images/logo.png';
    
    return {
      title: `${productName} | Plasma Water Africa`,
      description: productDescription.substring(0, 160),
      keywords: `${productName}, water products Kenya, ${product.category || 'water equipment'}, plasma water africa`,
      openGraph: {
        title: `${productName} | Plasma Water Africa`,
        description: productDescription.substring(0, 160),
        type: 'website', // Changed from 'product' to 'website'
        locale: 'en_KE',
        siteName: 'Plasma Water Africa',
        url: `${baseUrl}/products/${slug}`,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: productName,
          },
         ],
      },          
      twitter: {
        card: 'summary_large_image',
        title: `${productName} | Plasma Water Africa`,
        description: productDescription.substring(0, 160),
        images: [imageUrl],
      },
      alternates: {
        canonical: `${baseUrl}/products/${slug}`,
      },
      category: product.category || 'products',
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | Plasma Water Africa',
      description: 'Premium water products and solutions for your needs.',
    };
  }
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductDetailClient />;
}