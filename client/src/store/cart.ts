// src/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';

interface CartItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  specs?: string[];
  rating?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, qty?: number, onSuccess?: () => void) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemQty: (id: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      addItem: (product, qty = 1, onSuccess?: () => void) =>
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
                      specs: Object.values(product.specs || {}) as string[]
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
                  specs: Object.values(product.specs || {}) as string[]
                }];
          }
          const subtotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
          const result = {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
            subtotal
          };
          onSuccess?.();
          return result;
        }),
      updateQty: (id, qty) =>
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
        }),
      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter(item => item.id !== id);
          const subtotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
            subtotal
          };
        }),
      clearCart: () => set({ items: [], totalItems: 0, subtotal: 0 }),
      getItemQty: (id) => get().items.find(item => item.id === id)?.qty || 0
    }),
    {
      name: 'cart-storage'
    }
  )
);
