import type { Metadata } from 'next'

const BASE_URL = 'https://plasmawater.co.ke'

export function canonicalFromPath(pathname?: string) {
  if (!pathname) return undefined
  return `${BASE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

export function alternatesCanonical(pathname?: string): Metadata['alternates'] {
  const canonical = canonicalFromPath(pathname)
  if (!canonical) return undefined
  return { canonical }
}

