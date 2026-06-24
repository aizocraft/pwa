// app/products/[slug]/page.tsx
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { getProduct } from '../../../lib/api';

// Helper function to build SEO title
function buildProductSeoTitle(productName: string): string {
  return `${productName} | Plasma Water Africa`;
}

// Helper function to build SEO description
function buildProductSeoDescription(product: any): string {
  if (!product) return 'Premium water products and solutions for your needs.';
  
  const parts = [
    product.name,
    product.brand ? `by ${product.brand}` : '',
    product.type ? `${product.type} water equipment` : 'water equipment',
    'available at Plasma Water Africa'
  ];
  
  return parts.filter(Boolean).join(' ');
}

// Generate metadata dynamically based on product
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const product = await getProduct(slug);
    
    if (!product) {
      return {
        title: 'Product Not Found | Plasma Water Africa',
        description: 'The requested product could not be found.',
        robots: { index: false },
      };
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawaterafrica.com';
    const productName = product.name;
    const productDescription = buildProductSeoDescription(product);
    const canonicalPath = `/products/${slug}`;
    
    // Handle images properly based on your ProductImage type
    let imageUrls: string[] = [];
    const defaultImage = '/images/logo.png';
    
    if (product.images && product.images.length > 0) {
      imageUrls = product.images
        .map((img: any) => {
          // Handle different image structures
          if (typeof img === 'string') {
            return img.startsWith('http') ? img : `${baseUrl}${img}`;
          }
          if (img.url) {
            return img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`;
          }
          if (img.fileId) {
            return `${baseUrl}/api/products/image/${img.fileId}`;
          }
          return null;
        })
        .filter(Boolean) as string[];
    }
    
    // If no images found, use default
    if (imageUrls.length === 0) {
      imageUrls = [defaultImage];
    }
    
    // Build Open Graph images array
    const ogImages = imageUrls.map(url => ({
      url,
      width: 1200,
      height: 630,
      alt: productName,
    }));
    
    // Open Graph metadata should use a supported type
    const ogType = 'website';
    
    return {
      title: buildProductSeoTitle(productName),
      description: productDescription.substring(0, 160),
      keywords: [
        productName,
        product.category,
        'water products Kenya',
        'plasma water africa',
        product.brand,
        product.type,
        ...(product.tags || [])
      ].filter(Boolean).join(', '),
      
      openGraph: {
        title: buildProductSeoTitle(productName),
        description: productDescription.substring(0, 160),
        type: ogType,
        locale: 'en_KE',
        siteName: 'Plasma Water Africa',
        url: `${baseUrl}${canonicalPath}`,
        images: ogImages,
      },
      
      twitter: {
        card: imageUrls.length > 1 ? 'summary_large_image' : 'summary',
        title: buildProductSeoTitle(productName),
        description: productDescription.substring(0, 160),
        images: imageUrls.slice(0, 1), // Twitter only supports 1 image
      },
      
      alternates: {
        canonical: `${baseUrl}${canonicalPath}`,
      },
      
      category: product.category || 'products',
      
      // Additional metadata for better SEO
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
      
      // Add structured data via JSON-LD (optional but recommended)
      // You can add this using a script tag in your component instead
    };
    
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | Plasma Water Africa',
      description: 'Premium water products and solutions for your needs.',
      robots: { index: true, follow: true },
    };
  }
}

export default function ProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  return <ProductDetailClient />;
}