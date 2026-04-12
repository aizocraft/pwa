// src/types/product.ts
export interface Product {
  _id?: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  specs: Record<string, any>;
  stock: number;
  images: string[];
  featured: boolean;
  rating: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  category?: string;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  minRating?: number;
  tags?: string;
}