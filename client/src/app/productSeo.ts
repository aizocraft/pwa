// app/productSeo.ts
export function buildProductSeoTitle(name: string) {
  return `${name} | Plasma Water Africa`;
}

export function buildProductSeoDescription(input: {
  name: string
  brand?: string | null
  type?: string | null
}) {
  const brand = input.brand ? ` by ${input.brand}` : ''
  const type = input.type ? ` for ${input.type} applications` : ''
  return `Shop ${input.name}${brand}. High-performance water and energy equipment trusted by customers across Kenya. Detailed specifications, pricing, and availability—buy with confidence from Plasma Water Africa.`
}

