// src/store/cart.ts
import { create } from 'zustand';
import { getImageUrl } from '../lib/api';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { ShippingArea } from '../types/order';
import { getCompanySettings } from '../lib/company';

interface CartItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  specs?: string;
  rating?: number;
  category?: string;
  isTaxExempt?: boolean;
}

interface CartTotals {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingAreas: ShippingArea[];
  selectedShippingAreaId?: string;
  promoCode?: string;
  promoValid: boolean;
  promoError?: string;
  discount: number;
  shippingCost: number;
  taxRate: number;
  taxExemptCategories: string[];
  taxableSubtotal: number;
  taxExemptSubtotal: number;
  totals: CartTotals;
  loading: boolean;
  isHydrated: boolean;
  
  addItem: (product: Product, qty?: number, onSuccess?: () => void) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  getItemQty: (id: string) => number;
  loadShippingAreas: () => Promise<void>;
  loadTaxSettings: () => Promise<void>;
  setShippingArea: (id?: string) => Promise<void>;
  setPromoCode: (code?: string) => Promise<void>;
  recalculateTotals: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  syncToStorage: () => void;
  clearPromoError: () => void;
  resetHydration: () => void;
  hydrateFromStorage: () => Promise<void>;
}

const calculateShippingCost = (selectedArea: ShippingArea | undefined, subtotal: number): number => {
  if (!selectedArea) return 0;
  const freeThreshold = selectedArea.freeThreshold || 0;
  const qualifiesForFree = freeThreshold > 0 && subtotal >= freeThreshold;
  return qualifiesForFree ? 0 : (selectedArea.baseCost || 0);
};

const isProductTaxExempt = (category: string | undefined, taxExemptCategories: string[]): boolean => {
  if (!category || !taxExemptCategories.length) return false;
  return taxExemptCategories.some(exemptCat => 
    category.toLowerCase().includes(exemptCat.toLowerCase())
  );
};

let hydrationPromise: Promise<void> | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      shippingAreas: [],
      selectedShippingAreaId: undefined,
      promoCode: undefined,
      promoValid: false,
      promoError: undefined,
      discount: 0,
      shippingCost: 0,
      taxRate: 0.16,
      taxExemptCategories: [],
      taxableSubtotal: 0,
      taxExemptSubtotal: 0,
      totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 },
      loading: false,
      isHydrated: false,

      resetHydration: () => {
        set({ isHydrated: false });
        hydrationPromise = null;
      },

      clearPromoError: () => {
        set({ promoError: undefined });
      },

      async loadTaxSettings() {
        try {
          const settings = await getCompanySettings();
          const taxRate = settings?.taxRate ?? 0.16;
          const taxExemptCategories = settings?.taxExemptCategories ?? [];
          set({ taxRate, taxExemptCategories });
          
          const currentItems = get().items;
          if (currentItems.length > 0) {
            const updatedItems = currentItems.map(item => ({
              ...item,
              isTaxExempt: isProductTaxExempt(item.category, taxExemptCategories)
            }));
            set({ items: updatedItems });
            await get().recalculateTotals();
          }
        } catch (error) {
          console.warn('Failed to load tax settings:', error);
        }
      },

      async addItem(product, qty = 1, onSuccess) {
        const { taxExemptCategories } = get();
        const productCategory = product.category || '';
        const isTaxExempt = isProductTaxExempt(productCategory, taxExemptCategories);
        
        set((state) => {
          const existing = state.items.find(item => item.id === product._id);
          let newItems;
          
          if (existing) {
            newItems = state.items.map(item =>
              item.id === product._id
                ? { ...item, qty: item.qty + qty, isTaxExempt }
                : item
            );
          } else {
            newItems = [...state.items, {
              id: product._id as string,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0] ? getImageUrl(product.images[0]) : (product.imageUrls?.[0] || ''),
              price: Number(product.price),
              qty,
              rating: product.rating || 0,
              specs: Object.values(product.specs || {}).join(', ') || undefined,
              category: product.category,
              isTaxExempt
            }];
          }
          
          const subtotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
          
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
            subtotal
          };
        });
        
        await get().recalculateTotals();
        get().syncToStorage();
        onSuccess?.();
      },

      async updateQty(id, qty) {
        set((state) => {
          const newItems = state.items.map(item =>
            item.id === id ? { ...item, qty: Math.max(0, qty) } : item
          ).filter(item => item.qty > 0);
          
          const subtotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
          
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
            subtotal
          };
        });
        
        await get().recalculateTotals();
        get().syncToStorage();
      },

      async removeItem(id) {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== id);
          const subtotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
          
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
            subtotal
          };
        });
        
        await get().recalculateTotals();
        get().syncToStorage();
      },

      clearCart: () => {
        set({ 
          items: [], 
          totalItems: 0, 
          subtotal: 0,
          selectedShippingAreaId: undefined,
          promoCode: undefined,
          promoValid: false,
          promoError: undefined,
          discount: 0,
          shippingCost: 0,
          taxableSubtotal: 0,
          taxExemptSubtotal: 0,
          totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 }
        });
        
        try {
          localStorage.removeItem('cart-storage');
          sessionStorage.removeItem('cart-session');
          document.cookie = 'cartData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        } catch (e) {
          console.warn('Error clearing storage:', e);
        }
      },

      getItemQty: (id) => {
        return get().items.find(item => item.id === id)?.qty || 0;
      },

      async loadShippingAreas() {
        const { getPublicShippingAreas } = await import('../lib/api');
        
        try {
          set({ loading: true });
          const areas = await getPublicShippingAreas();
          set({ shippingAreas: areas.filter(a => a.isActive) });
        } catch (error) {
          console.warn('Failed to load shipping areas:', error);
          set({ shippingAreas: [] });
        } finally {
          set({ loading: false });
        }
      },

      async setShippingArea(id?: string) {
        set({ selectedShippingAreaId: id });
        await get().recalculateTotals();
        get().syncToStorage();
      },

      async setPromoCode(code) {
        if (!code) {
          set({ 
            promoCode: undefined, 
            promoValid: false, 
            discount: 0,
            promoError: undefined 
          });
          await get().recalculateTotals();
          get().syncToStorage();
          return;
        }

        const { validatePromo } = await import('../lib/api');
        const currentSubtotal = get().subtotal;
        
        try {
          const result = await validatePromo(code, currentSubtotal);
          
          if (result.valid && result.discount !== undefined) {
            set({ 
              promoCode: code, 
              promoValid: true, 
              discount: result.discount,
              promoError: undefined
            });
          } else {
            const errorMsg = result.error || 'Invalid or expired promo code';
            set({ 
              promoCode: code, 
              promoValid: false, 
              discount: 0,
              promoError: errorMsg
            });
          }
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || 'Failed to validate promo code';
          set({ 
            promoCode: code, 
            promoValid: false, 
            discount: 0,
            promoError: errorMsg
          });
        }
        
        await get().recalculateTotals();
        get().syncToStorage();
      },

      async recalculateTotals() {
        const state = get();
        
        if (state.items.length === 0) {
          set({
            totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 },
            shippingCost: 0,
            discount: 0,
            taxableSubtotal: 0,
            taxExemptSubtotal: 0
          });
          return;
        }

        let taxableSubtotal = 0;
        let taxExemptSubtotal = 0;
        
        for (const item of state.items) {
          const itemTotal = item.price * item.qty;
          if (item.isTaxExempt === true) {
            taxExemptSubtotal += itemTotal;
          } else {
            taxableSubtotal += itemTotal;
          }
        }
        
        const selectedArea = state.shippingAreas.find(area => area._id === state.selectedShippingAreaId);
        const shippingCost = calculateShippingCost(selectedArea, state.subtotal);
        const tax = taxableSubtotal * state.taxRate;
        const discount = state.promoValid ? state.discount : 0;
        const total = taxableSubtotal + taxExemptSubtotal + shippingCost + tax - discount;
        
        set({
          shippingCost,
          discount,
          taxableSubtotal,
          taxExemptSubtotal,
          totals: { subtotal: state.subtotal, shippingCost, discount, tax, total }
        });
      },

      syncToStorage: () => {
        const state = get();
        const cartData = {
          items: state.items,
          subtotal: state.subtotal,
          totalItems: state.totalItems,
          selectedShippingAreaId: state.selectedShippingAreaId,
          promoCode: state.promoCode,
          promoValid: state.promoValid,
          discount: state.discount,
          shippingCost: state.shippingCost,
          totals: state.totals,
          taxableSubtotal: state.taxableSubtotal,
          taxExemptSubtotal: state.taxExemptSubtotal,
          timestamp: Date.now()
        };

        try {
          localStorage.setItem('cart-storage', JSON.stringify(cartData));
          sessionStorage.setItem('cart-session', JSON.stringify(cartData));
          document.cookie = `cartData=${JSON.stringify(cartData)}; path=/; max-age=86400; SameSite=Strict`;
        } catch (e) {
          console.warn('Error syncing to storage:', e);
        }
      },

      async loadInitialData() {
        if (get().isHydrated) return;
        if (hydrationPromise) {
          await hydrationPromise;
          return;
        }
        hydrationPromise = this.hydrateFromStorage();
        await hydrationPromise;
        hydrationPromise = null;
      },

      async hydrateFromStorage() {
        let storedData = null;
        
        try {
          const ls = localStorage.getItem('cart-storage');
          if (ls) storedData = JSON.parse(ls);
        } catch (e) {}
        
        if (!storedData) {
          try {
            const ss = sessionStorage.getItem('cart-session');
            if (ss) storedData = JSON.parse(ss);
          } catch (e) {}
        }
        
        if (!storedData) {
          try {
            const cookies = document.cookie.split('; ').find(row => row.startsWith('cartData='));
            if (cookies) storedData = JSON.parse(decodeURIComponent(cookies.split('=')[1]));
          } catch (e) {}
        }
        
        await get().loadTaxSettings();
        const { taxExemptCategories } = get();
        
        if (storedData?.items?.length && storedData.timestamp && Date.now() - storedData.timestamp < 86400000) {
          const itemsWithFlags = storedData.items.map((item: any) => ({
            ...item,
            isTaxExempt: isProductTaxExempt(item.category, taxExemptCategories)
          }));
          
          const subtotal = itemsWithFlags.reduce((s: number, i: any) => s + i.price * i.qty, 0);
          
          let taxable = 0, taxExempt = 0;
          for (const item of itemsWithFlags) {
            const total = item.price * item.qty;
            if (item.isTaxExempt) taxExempt += total;
            else taxable += total;
          }
          
          set({
            items: itemsWithFlags,
            subtotal,
            totalItems: itemsWithFlags.reduce((s: number, i: any) => s + i.qty, 0),
            selectedShippingAreaId: storedData.selectedShippingAreaId,
            promoCode: storedData.promoCode,
            taxableSubtotal: taxable,
            taxExemptSubtotal: taxExempt,
            isHydrated: true
          });
          
          await get().loadShippingAreas();
          
          if (storedData.promoCode && subtotal > 0) {
            const { validatePromo } = await import('../lib/api');
            try {
              const result = await validatePromo(storedData.promoCode, subtotal);
              if (result.valid && result.discount) {
                set({ promoValid: true, discount: result.discount });
              } else {
                set({ promoValid: false, discount: 0, promoError: result.error });
              }
            } catch (e) {}
          }
          
          await get().recalculateTotals();
        } else {
          await get().loadShippingAreas();
          set({ isHydrated: true });
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        totalItems: state.totalItems,
        selectedShippingAreaId: state.selectedShippingAreaId,
        promoCode: state.promoCode,
        discount: state.discount,
        shippingCost: state.shippingCost,
        totals: state.totals,
        taxableSubtotal: state.taxableSubtotal,
        taxExemptSubtotal: state.taxExemptSubtotal
      })
    }
  )
);