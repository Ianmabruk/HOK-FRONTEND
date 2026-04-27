import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function buildCartItemKey(productId, customizations) {
  const suffix = customizations ? JSON.stringify(customizations) : 'default'
  return `${productId}:${suffix}`
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, customizations = null) => {
        const itemKey = buildCartItemKey(product.id, customizations)
        const existing = get().items.find((i) => i.itemKey === itemKey)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...get().items, { ...product, customizations, itemKey, quantity: 1 }] })
        }
      },
      removeItem: (itemKey) => set({ items: get().items.filter((i) => i.itemKey !== itemKey) }),
      updateQty: (itemKey, qty) => {
        if (qty < 1) return get().removeItem(itemKey)
        set({ items: get().items.map((i) => (i.itemKey === itemKey ? { ...i, quantity: qty } : i)) })
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
