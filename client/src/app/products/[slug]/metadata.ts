import type { Metadata } from 'next'

import { makeSeo } from '../../seo'
import { buildProductSeoTitle, buildProductSeoDescription } from '../../productSeo'
import { getProduct } from '../../../lib/api'

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const product = await getProduct(params.slug)

  const title = buildProductSeoTitle(product?.name ?? 'Product')
  const description = buildProductSeoDescription({
    name: product?.name ?? 'Product',
    brand: product?.brand ?? null,
    type: product?.type ?? null,
  })

  const canonicalPath = `/products/${params.slug}`

  return makeSeo({
    title,
    description,
    canonicalPath,
    keywords: product?.tags ?? undefined,
    openGraph: {
      title,
      description,
      images: product?.images?.length
        ? ([{
            url: String(product.images[0]) as any,
            width: 1200,
            height: 630,
            alt: product?.name ?? 'Product',
          }] as any)
        : undefined,
    },
  })
}

