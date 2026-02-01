/**
 * Zustand cart store
 * Manages cart state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/types/api';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Check if item already exists (same product and size)
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.selectedSize === item.selectedSize
          );

          if (existingIndex >= 0) {
            // Increment quantity
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }

          // Add new item
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId, selectedSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.selectedSize === selectedSize)
          ),
        }));
      },

      updateQuantity: (productId, quantity, selectedSize) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'lego-cart-storage',
    }
  )
);
