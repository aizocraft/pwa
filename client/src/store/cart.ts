// src/store/cart.ts
import { create } from 'zustand';
import { getImageUrl } from '../lib/api';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { ShippingArea } from '../types/order';
import toast from 'react-hot-toast';
import { getTaxRate } from '../lib/company';

interface CartItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  specs?: string;
  rating?: number;
}

interface CartTotals {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
}

interface CartState {
  // State
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
  totals: CartTotals;
  loading: boolean;
  isHydrated: boolean;
  
  // Actions
  addItem: (product: Product, qty?: number, onSuccess?: () => void) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  getItemQty: (id: string) => number;
  loadShippingAreas: () => Promise<void>;
  setShippingArea: (id?: string) => Promise<void>;
  setPromoCode: (code?: string) => Promise<void>;
  recalculateTotals: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  loadTaxRate: () => Promise<void>;
  syncToStorage: () => void;
  clearPromoError: () => void;
  resetHydration: () => void;
  hydrateFromStorage: () => Promise<void>;
}

// Helper: Calculate shipping cost
const calculateShippingCost = (selectedArea: ShippingArea | undefined, subtotal: number): number => {
  if (!selectedArea) return 0;
  const freeThreshold = selectedArea.freeThreshold || 0;
  const qualifiesForFree = freeThreshold > 0 && subtotal >= freeThreshold;
  return qualifiesForFree ? 0 : (selectedArea.baseCost || 0);
};

// Global hydration lock
let hydrationPromise: Promise<void> | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
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
      totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 },
      loading: false,
      isHydrated: false,

      // Reset hydration flag (useful for logout)
      resetHydration: () => {
        set({ isHydrated: false });
        hydrationPromise = null;
      },

      // Clear promo error
      clearPromoError: () => {
        set({ promoError: undefined });
      },

      // Add item to cart
      async addItem(product, qty = 1, onSuccess) {
        set((state) => {
          const existing = state.items.find(item => item.id === product._id);
          let newItems;
          
          if (existing) {
            newItems = state.items.map(item =>
              item.id === product._id
                ? { ...item, qty: item.qty + qty }
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
              specs: Object.values(product.specs || {}).join(', ') || undefined
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

      // Update item quantity
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

      // Remove item from cart
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

      // Clear entire cart
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
          totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 }
        });
        
        // Clear storage
        try {
          localStorage.removeItem('cart-storage');
          sessionStorage.removeItem('cart-session');
          document.cookie = 'cartData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        } catch (e) {

        }
      },

      // Get item quantity
      getItemQty: (id) => {
        return get().items.find(item => item.id === id)?.qty || 0;
      },

      // Load shipping areas
      async loadShippingAreas() {
        const { getPublicShippingAreas } = await import('../lib/api');
        
        try {
          set({ loading: true });
          const areas = await getPublicShippingAreas();
          set({ shippingAreas: areas.filter(a => a.isActive) });

        } catch (error) {

          set({ shippingAreas: [] });
        } finally {
          set({ loading: false });
        }
      },

      // Load tax rate from server
      async loadTaxRate() {
        try {
          const taxRate = await getTaxRate();
          set({ taxRate });
        } catch (error) {
          console.warn('Failed to load tax rate, using default:', error);
          // Keep default tax rate
        }
      },

      // Set shipping area
      async setShippingArea(id?: string) {
        set({ selectedShippingAreaId: id });
        await get().recalculateTotals();
        get().syncToStorage();
      },

      // Set and validate promo code
      async setPromoCode(code) {
        // Clear existing promo
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

      // Recalculate all totals
      async recalculateTotals() {
        const state = get();
        
        if (state.items.length === 0) {
          set({
            totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 },
            shippingCost: 0,
            discount: 0
          });
          return;
        }

        const selectedArea = state.shippingAreas.find(area => area._id === state.selectedShippingAreaId);
        const shippingCost = calculateShippingCost(selectedArea, state.subtotal);
        const tax = state.subtotal * state.taxRate;
        const discount = state.promoValid ? state.discount : 0;
        const total = state.subtotal + shippingCost + tax - discount;
        
        const newTotals = {
          subtotal: state.subtotal,
          shippingCost,
          discount,
          tax,
          total
        };
        
        set({
          shippingCost,
          discount,
          totals: newTotals
        });
        

      },

      // Sync cart to all storage
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
          timestamp: Date.now()
        };

        try {
          localStorage.setItem('cart-storage', JSON.stringify(cartData));
          sessionStorage.setItem('cart-session', JSON.stringify(cartData));
          document.cookie = `cartData=${JSON.stringify(cartData)}; path=/; max-age=86400; SameSite=Strict`;
        } catch (e) {

        }
      },

      // Load initial data with hydration lock
      async loadInitialData() {
        // If already hydrated, skip
        if (get().isHydrated) {

          return;
        }

        // If hydration is in progress, wait for it
        if (hydrationPromise) {

          await hydrationPromise;
          return;
        }

        // Start new hydration
        hydrationPromise = this.hydrateFromStorage();
        await hydrationPromise;
        hydrationPromise = null;
      },

      // Hydrate from storage (called once)
      async hydrateFromStorage() {

        
        // Try to get data from storage
        let storedData = null;
        
        try {
          // Try localStorage first
          const ls = localStorage.getItem('cart-storage');
          if (ls) {
            storedData = JSON.parse(ls);

          }
        } catch (e) {
          console.warn('Error reading localStorage:', e);
        }
        
        // If no localStorage, try sessionStorage
        if (!storedData) {
          try {
            const ss = sessionStorage.getItem('cart-session');
            if (ss) {
              storedData = JSON.parse(ss);
              console.log('📦 Found data in sessionStorage');
            }
          } catch (e) {
            console.warn('Error reading sessionStorage:', e);
          }
        }
        
        // If no sessionStorage, try cookies
        if (!storedData) {
          try {
            const cookies = document.cookie.split('; ').find(row => row.startsWith('cartData='));
            if (cookies) {
              storedData = JSON.parse(decodeURIComponent(cookies.split('=')[1]));
              console.log('📦 Found data in cookies');
            }
          } catch (e) {
            console.warn('Error reading cookies:', e);
          }
        }
        
        // Validate stored data
        if (storedData && storedData.timestamp && Date.now() - storedData.timestamp < 24 * 60 * 60 * 1000) {
          const isValid = storedData.items?.every((item: any) => 
            item && item.id && typeof item.price === 'number' && typeof item.qty === 'number' && item.qty > 0
          );
          
          if (isValid) {
            // Set basic cart data
            set({
              items: storedData.items || [],
              subtotal: storedData.subtotal || 0,
              totalItems: storedData.totalItems || 0,
              selectedShippingAreaId: storedData.selectedShippingAreaId,
              promoCode: storedData.promoCode,
              promoValid: false, // Will re-validate
              discount: 0, // Will recalculate
              promoError: undefined,
              shippingCost: storedData.shippingCost || 0,
              totals: storedData.totals || { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 },
              isHydrated: true
            });
            

            
            // Load shipping areas
            await get().loadShippingAreas();
            
            // Load tax rate
            await get().loadTaxRate();
            
            // Re-validate promo if exists
            if (storedData.promoCode && storedData.subtotal > 0) {
              const { validatePromo } = await import('../lib/api');
              try {
                const result = await validatePromo(storedData.promoCode, storedData.subtotal);
                if (result.valid && result.discount !== undefined) {
                  set({
                    promoValid: true,
                    discount: result.discount,
                    promoError: undefined
                  });

                } else {
                  set({
                    promoValid: false,
                    discount: 0,
                    promoError: result.error || 'Promo code is no longer valid'
                  });
                  // Clear invalid promo from storage
                  get().syncToStorage();
                }
              } catch (error) {

              }
            }
            
            // Recalculate final totals
            await get().recalculateTotals();
          } else {

            get().clearCart();
          }
        } else {
          // No stored data, load fresh data
          await get().loadShippingAreas();
          await get().loadTaxRate();
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
        totals: state.totals
      }),
      onRehydrateStorage: () => {

        return (state, error) => {
          if (error) {

          } else if (state) {

          }
        };
      }
    }
  )
);