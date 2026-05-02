// ─────────────────────────────────────────────
// EWA Catalogue — Cart Store (Pinia)
// Ready for checkout/backend integration
// ─────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  function addItem(product: Product, quantity = 1) {
    const existing = items.value.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    isOpen.value = true
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(i => i.product.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(i => i.product.id === productId)
    if (item) {
      if (quantity <= 0) removeItem(productId)
      else item.quantity = quantity
    }
  }

  function clearCart() {
    items.value = []
  }

  function toggleCart() {
    isOpen.value = !isOpen.value
  }

  // Returns payload shape expected by the backend order endpoint
  function getOrderPayload(contact: string) {
    return {
      items: items.value.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
      contact,
    }
  }

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getOrderPayload,
  }
})
