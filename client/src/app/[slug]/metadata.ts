import type { Metadata } from 'next'

import { makeSeo } from '../seo'
import { buildProductSeoTitle, buildProductSeoDescription } from '../productSeo'
import { getProduct } from '../../lib/api'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let product

  try {
    product = await getProduct(params.slug)
  } catch (error) {
    product = null
  }

  if (!product) {
    return makeSeo({
      title: 'Product Not Found | Plasma Water Africa',
      description: 'The requested product is not available.',
      canonicalPath: `/${params.slug}`,
      openGraph: {
        title: 'Product Not Found | Plasma Water Africa',
        description: 'The requested product is not available.',
      },
      keywords: ['product', 'not found', 'Plasma Water Africa'],
    })
  }

  const title = buildProductSeoTitle(product.name)
  const description = buildProductSeoDescription({
    name: product.name,
    brand: product.brand || undefined,
    type: product.type || undefined,
  })

  const firstImage = product.images?.[0]
  const imageUrl = firstImage
    ? firstImage.url
      ? firstImage.url.startsWith('http')
        ? firstImage.url
        : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke'}${firstImage.url}`
      : firstImage.fileId
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://plasmawater.co.ke'}/api/products/image/${firstImage.fileId}`
        : undefined
    : undefined

  return makeSeo({
    title,
    description,
    canonicalPath: `/${params.slug}`,
    keywords: product.tags ?? undefined,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : undefined,
    },
  })
}
