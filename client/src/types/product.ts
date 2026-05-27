// src/types/product.ts

export interface ProductImage {
  type: 'url' | 'gridfs';
  url?: string;
  fileId?: string;
  filename?: string;
  mimeType?: string;
}

export interface BuyingPriceHistory {
  price: number;
  effectiveFrom: string;
  effectiveTo?: string;
  changedBy: string;
  reason?: string;
}

export interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  taxId?: string;
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
  status: 'active' | 'inactive';
  productsSupplied?: string[];
  totalPurchases: number;
  lastPurchaseDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  sku: string; // Auto-generated SKU (e.g., "ELE-001")
  category: string;
  brand: string;
  type: string;
  price: number; // Selling price
  buyingPrice: number; // Cost price for profit calculation
  compareAtPrice?: number;
  description?: string;
  specs: Record<string, any>;
  stock: number;
  images: ProductImage[];
  featured: boolean;
  rating: number;
  tags: string[];
  
  // Supplier fields
  supplier?: string | Supplier; // Reference to supplier
  supplierName?: string; // Denormalized supplier name
  
  // Price history
  buyingPriceHistory?: BuyingPriceHistory[];
  
  // Profit metrics (virtuals)
  profitMargin?: number; // Profit margin percentage based on selling price
  profitAmount?: number; // Absolute profit amount
  marginPercentage?: number; // Markup percentage based on cost
  
  // Computed virtuals
  imageUrls?: string[];
  discountPercent?: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Create Product DTO (omit fields that are auto-generated)
export interface CreateProductRequest {
  name: string;
  category: string;
  brand?: string;
  type?: string;
  price: number;
  buyingPrice: number;
  compareAtPrice?: number;
  description?: string;
  specs?: Record<string, any>;
  stock?: number;
  images?: ProductImage[];
  featured?: boolean;
  tags?: string[];
  supplierId?: string; // For creating/updating supplier reference
  supplierName?: string;
}

// Update Product Request
export interface UpdateProductRequest {
  name?: string;
  category?: string;
  brand?: string;
  type?: string;
  price?: number;
  buyingPrice?: number;
  compareAtPrice?: number;
  description?: string;
  specs?: Record<string, any>;
  stock?: number;
  images?: ProductImage[];
  featured?: boolean;
  tags?: string[];
  supplierId?: string;
  supplierName?: string;
  priceChangeReason?: string; // For tracking why buying price changed
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
  supplier?: string; // Filter by supplier
  minProfitMargin?: number; // Filter by minimum profit margin
  lowStock?: boolean; // Filter low stock items
}

// Product Stats Types
export interface ProductProfitStats {
  averageProfitMargin: number;
  averageMarkup: number;
  totalInventoryValue: number;
  totalPotentialProfit: number;
  productsWithMargin: number;
  negativeMarginProducts: number;
}

export interface ProductStockAlert {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  buyingPrice: number;
  category: string;
  supplierName?: string;
}

// Inventory Types
export interface InventorySummary {
  totalStockValue: number;
  totalInventoryValue: number;
  totalPotentialProfit: number;
  totalUnits: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface CategoryInventoryBreakdown {
  _id: string;
  stockValue: number;
  inventoryValue: number;
  units: number;
  potentialProfit?: number;
}

// Supplier Types (detailed)
export interface SupplierListResponse {
  suppliers: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateSupplierRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  taxId?: string;
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateSupplierRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  taxId?: string;
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
  status?: 'active' | 'inactive';
}

export interface SupplierStats {
  summary: {
    totalSuppliers: number;
    activeSuppliers: number;
    totalPurchaseVolume: number;
  };
  supplierProducts: Array<{
    _id: string;
    productCount: number;
    totalStockValue: number;
    totalInventoryValue: number;
  }>;
}

// Buying Price Update Request
export interface UpdateBuyingPriceRequest {
  buyingPrice: number;
  reason?: string;
}

// Profit Types (for analytics)
export interface ProfitSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalUnitsSold: number;
  overallMargin: number;
}

export interface ProductProfitBreakdown {
  _id: string;
  productName: string;
  productSku: string;
  category: string;
  brand: string;
  supplierId: string;
  supplierName: string;
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  averageSellingPrice: number;
  averageBuyingPrice: number;
}

export interface CategoryProfitBreakdown {
  _id: string;
  totalRevenue: number;
  totalCost: number;
  totalUnitsSold: number;
  totalProfit: number;
  margin: number;
}

export interface SupplierProfitBreakdown {
  _id: string;
  supplierId: string;
  totalRevenue: number;
  totalCost: number;
  totalUnitsSold: number;
  totalProfit: number;
  margin: number;
}

export interface ProfitTrend {
  _id: string;
  revenue: number;
  cost: number;
  unitsSold: number;
  profit: number;
  margin: number;
}

export interface TopProfitProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  totalRevenue: number;
  totalProfit: number;
  totalUnitsSold: number;
  profitPerUnit: number;
  margin: number;
}

// Helper function to format SKU
export function formatSKU(category: string, sequence: number): string {
  const prefix = category.substring(0, 3).toUpperCase().padEnd(3, 'X');
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `${prefix}-${paddedSequence}`;
}

// Helper function to parse SKU
export function parseSKU(sku: string): { prefix: string; number: number } | null {
  const match = sku.match(/^([A-Z]{3})-(\d{3})$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseInt(match[2], 10)
  };
}

// Helper function to calculate profit margin
export function calculateProfitMargin(sellingPrice: number, buyingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - buyingPrice) / sellingPrice) * 100;
}

// Helper function to calculate markup
export function calculateMarkup(sellingPrice: number, buyingPrice: number): number {
  if (buyingPrice <= 0) return 0;
  return ((sellingPrice - buyingPrice) / buyingPrice) * 100;
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}