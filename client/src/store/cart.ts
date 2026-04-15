// src/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { ShippingArea } from '../types/order';

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
import toast from 'react-hot-toast';

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
  discount: number;
  shippingCost: number;
  taxRate: 0.16;
  totals: CartTotals;
  loading: boolean;
  addItem: (product: Product, qty?: number, onSuccess?: () => void) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  getItemQty: (id: string) => number;
  loadShippingAreas: () => Promise<void>;
  setShippingArea: (id?: string) => void;
  setPromoCode: (code?: string) => Promise<void>;
  recalculateTotals: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  syncToAllStorage: () => void;
  hydrateFromStorage: () => void;
  rehydrateCart: () => void;
}

// Helper function to calculate shipping cost locally
const calculateLocalShippingCost = (selectedArea: ShippingArea | undefined, subtotal: number): number => {
  if (!selectedArea) return 0;
  
  const freeThreshold = selectedArea.freeThreshold || 0;
  const isFreeShippingEnabled = freeThreshold > 0;
  const qualifiesForFreeShipping = isFreeShippingEnabled && subtotal >= freeThreshold;
  
  if (qualifiesForFreeShipping) {
    return 0;
  }
  
  return selectedArea.baseCost || 0;
};

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
      discount: 0,
      shippingCost: 0,
      taxRate: 0.16,
      totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 },
      loading: false,

      async addItem(product, qty = 1, onSuccess) {
        set((state) => {
          const existing = state.items.find(item => item.id === product._id);
          let newItems;
          if (existing) {
            newItems = state.items.map(item =>
              item.id === product._id
                ? { 
                    ...item, 
                    qty: item.qty + qty,
                    rating: product.rating || 0,
                    specs: item.specs ? item.specs + ', ' + (Object.values(product.specs || {}).join(', ') || '') : Object.values(product.specs || {}).join(', ') || undefined
                  }
                : item
            );
          } else {
            newItems = [...state.items, {
              id: product._id as string,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0] || '',
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
        await get().syncToAllStorage();
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
        await get().syncToAllStorage();
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
        await get().syncToAllStorage();
      },

      clearCart: () => {
        set({ 
          items: [], 
          totalItems: 0, 
          subtotal: 0,
          selectedShippingAreaId: undefined,
          promoCode: undefined,
          promoValid: false,
          discount: 0,
          shippingCost: 0,
          totals: { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 }
        });
        // Clear all storage
        try {
          localStorage.removeItem('cart-storage');
          sessionStorage.removeItem('cart-session');
          document.cookie = 'cartData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        } catch (e) {
          console.warn('Error clearing storage:', e);
        }
      },

      getItemQty: (id) => {
        const state = get();
        return state.items.find(item => item.id === id)?.qty || 0;
      },

      async loadShippingAreas() {
        const { getShippingAreas, getPublicShippingAreas } = await import('../lib/api');
        const { getToken } = await import('../lib/auth');
        try {
          set({ loading: true });
          
          let result;
          if (getToken()) {
            // Logged-in user: full admin areas
            result = await getShippingAreas();
          } else {
            // Guest user: public areas only
            const areas = await getPublicShippingAreas();
            result = { areas }; // Normalize shape
          }
          
          const areas = result.areas || [];
          set({ shippingAreas: areas.filter((a: ShippingArea) => a.isActive) });
          console.log('✅ Shipping areas loaded:', areas.length, getToken() ? '(logged-in)' : '(guest)');
        } catch (error) {
          console.error('Failed to load shipping areas:', error);
        } finally {
          set({ loading: false });
        }
      },

      setShippingArea: async (id?: string) => {
        set({ selectedShippingAreaId: id });
        await get().recalculateTotals();
        get().syncToAllStorage();
      },

      async setPromoCode(code) {
        if (!code) {
          set({ promoCode: undefined, promoValid: false, discount: 0 });
          await get().recalculateTotals();
          return;
        }

        const { validatePromo } = await import('../lib/api');
        const result = await validatePromo(code, get().subtotal);
        
        if (result.valid && result.discount !== undefined) {
          set({ 
            promoCode: code, 
            promoValid: true, 
            discount: result.discount 
          });
        } else {
          set({ promoCode: code, promoValid: false, discount: 0 });
        }
        await get().recalculateTotals();
      },

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

        // FIXED: Calculate shipping cost locally based on selected area
        const selectedArea = state.shippingAreas.find(area => area._id === state.selectedShippingAreaId);
        const calculatedShippingCost = calculateLocalShippingCost(selectedArea, state.subtotal);
        
        // Calculate tax
        const tax = state.subtotal * state.taxRate;
        
        // Calculate total with discount
        const discount = state.promoValid ? state.discount : 0;
        const total = state.subtotal + calculatedShippingCost + tax - discount;
        
        // Update totals
        const newTotals: CartTotals = {
          subtotal: state.subtotal,
          shippingCost: calculatedShippingCost,
          discount: discount,
          tax: tax,
          total: total
        };
        
        set({
          shippingCost: calculatedShippingCost,
          discount: discount,
          totals: newTotals
        });
        
        console.log('📊 Totals recalculated:', {
          subtotal: state.subtotal,
          shippingCost: calculatedShippingCost,
          freeShippingEnabled: selectedArea?.freeThreshold ? selectedArea.freeThreshold > 0 : false,
          freeThreshold: selectedArea?.freeThreshold,
          qualifiesForFree: selectedArea?.freeThreshold ? state.subtotal >= selectedArea.freeThreshold : false,
          tax,
          discount,
          total
        });
        
        // Optional: Also call backend for promo validation if needed
        if (state.promoCode && state.promoValid === false) {
          const { validatePromo } = await import('../lib/api');
          try {
            const result = await validatePromo(state.promoCode, state.subtotal);
            if (result.valid && result.discount !== undefined) {
              const updatedDiscount = result.discount;
              const updatedTotal = state.subtotal + calculatedShippingCost + tax - updatedDiscount;
              set({
                discount: updatedDiscount,
                promoValid: true,
                totals: {
                  ...newTotals,
                  discount: updatedDiscount,
                  total: updatedTotal
                }
              });
            }
          } catch (error) {
            console.error('Failed to validate promo during recalculation:', error);
          }
        }
      },

      async loadInitialData() {
        await get().hydrateFromStorage();
        const state = get();
        // Only load if no shipping areas (avoid reloads)
        if (state.shippingAreas.length === 0) {
          await get().loadShippingAreas();
        }
        // Recalc totals if items exist (sync persisted data)
        if (state.items.length > 0 && state.subtotal > 0) {
          await get().recalculateTotals();
        }
      },

      // Triple persistence layer (localStorage + sessionStorage + cookies)
      syncToAllStorage: () => {
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

        // 1. LocalStorage (primary - persists across sessions)
        try {
          localStorage.setItem('cart-storage', JSON.stringify(cartData));
          console.log('✅ Cart synced to localStorage:', state.totalItems, 'items');
        } catch (e) {
          console.warn('localStorage unavailable:', e);
        }

        // 2. SessionStorage (backup - current session)
        try {
          sessionStorage.setItem('cart-session', JSON.stringify(cartData));
          console.log('✅ Cart synced to sessionStorage');
        } catch (e) {
          console.warn('sessionStorage unavailable:', e);
        }

        // 3. Cookies (fallback - server-readable)
        try {
          document.cookie = `cartData=${JSON.stringify(cartData)}; path=/; max-age=86400; SameSite=Strict`;
          console.log('✅ Cart synced to cookies');
        } catch (e) {
          console.warn('cookies unavailable:', e);
        }
      },

      hydrateFromStorage: () => {
        let hydratedData = null;
        const sources = [
          () => {
            try {
              const ls = localStorage.getItem('cart-storage');
              return ls ? JSON.parse(ls) : null;
            } catch {
              return null;
            }
          },
          () => {
            try {
              const ss = sessionStorage.getItem('cart-session');
              return ss ? JSON.parse(ss) : null;
            } catch {
              return null;
            }
          },
          () => {
            try {
              const cookies = document.cookie.split('; ').find(row => row.startsWith('cartData='));
              if (cookies) {
                const data = cookies.split('=')[1];
                return JSON.parse(decodeURIComponent(data));
              }
              return null;
            } catch {
              return null;
            }
          }
        ];

        for (const source of sources) {
          const data = source();
          if (data && data.timestamp && Date.now() - data.timestamp < 24*60*60*1000) { // 24h valid
            hydratedData = data;
            console.log('✅ Cart hydrated from storage:', data.items?.length || 0, 'items');
            break;
          }
        }

        if (hydratedData) {
          // Validate shape
          const isValidData = hydratedData.items?.every((item: any) => 
            item && item.id && typeof item.price === 'number' && typeof item.qty === 'number' && item.qty > 0
          ) ?? false;
          
          if (!isValidData) {
            console.warn('❌ Invalid cart data shape, clearing');
            toast.error('Cart data recovered - some items may have been cleared');
            try {
              localStorage.removeItem('cart-storage');
              sessionStorage.removeItem('cart-session');
            } catch {}
            return;
          }
          
          set({
            items: hydratedData.items || [],
            subtotal: hydratedData.subtotal || 0,
            totalItems: hydratedData.totalItems || 0,
            selectedShippingAreaId: hydratedData.selectedShippingAreaId,
            promoCode: hydratedData.promoCode,
            promoValid: hydratedData.promoValid || false,
            discount: hydratedData.discount || 0,
            shippingCost: hydratedData.shippingCost || 0,
            totals: hydratedData.totals || { subtotal: 0, shippingCost: 0, discount: 0, tax: 0, total: 0 }
          });
          setTimeout(() => get().syncToAllStorage(), 100);
        }
      },

      rehydrateCart: () => {
        get().hydrateFromStorage();
        get().loadInitialData();
      }
    }),

    {
      name: 'cart-storage-full',
      partialize: (state) => ({ 
        items: state.items, 
        subtotal: state.subtotal,
        totalItems: state.totalItems,
        selectedShippingAreaId: state.selectedShippingAreaId,
        promoCode: state.promoCode,
        promoValid: state.promoValid,
        discount: state.discount,
        shippingCost: state.shippingCost,
        totals: state.totals
      }),
      onRehydrateStorage: () => {
        console.log('🔄 Cart store rehydrated');
      }
    }
  )
);