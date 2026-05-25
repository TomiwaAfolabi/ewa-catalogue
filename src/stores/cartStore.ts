// ─────────────────────────────────────────────
// EWA Catalogue — Cart Store (Pinia)
// Ready for checkout/backend integration
// ─────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '@/types'
import { canPurchaseProduct, productStockQuantity } from '@/utils/inventory'
import { cartTotalKobo, productUnitPriceKobo } from '@/utils/pricing'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  /** Exact naira total for display (kobo ÷ 100, matches Paystack). */
  const totalPrice = computed(() => cartTotalKobo(items.value) / 100)

  const isEmpty = computed(() => items.value.length === 0)

  const hasUnavailableItems = computed(() =>
    items.value.some((i) => !canPurchaseProduct(i.product)),
  )

  function addItem(product: Product, quantity = 1): boolean {
    if (!canPurchaseProduct(product)) return false
    const maxQty = Math.max(0, productStockQuantity(product))
    if (maxQty <= 0) return false
    const requested = Math.floor(Number(quantity)) || 1
    const q = Math.min(maxQty, Math.max(1, requested))
    const existing = items.value.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity = Math.min(maxQty, existing.quantity + q)
    } else {
      items.value.push({ product, quantity: q })
    }
    isOpen.value = true
    return true
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(i => i.product.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(i => i.product.id === productId)
    if (!item) return
    const maxQty = Math.max(0, productStockQuantity(item.product))
    if (quantity <= 0 || maxQty <= 0) removeItem(productId)
    else {
      const next = Math.floor(Number(quantity))
      item.quantity = Math.min(maxQty, Math.max(1, Number.isFinite(next) ? next : 1))
    }
  }

  function clearCart() {
    items.value = []
  }

  function toggleCart() {
    isOpen.value = !isOpen.value
  }

  function closeCart() {
    isOpen.value = false
  }

  /** Payload for `POST /v1/orders` (matches `CreateOrderDto`). */
  function getOrderPayload(extra?: {
    shippingSnapshot?: Record<string, unknown>
    notes?: string
    shippingAmount?: number
    taxAmount?: number
  }) {
    return {
      items: items.value.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        expectedUnitPriceKobo: productUnitPriceKobo(i.product),
        ...(i.selectedSize ? { selectedSize: i.selectedSize } : {}),
      })),
      ...extra,
    }
  }

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    isEmpty,
    hasUnavailableItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    getOrderPayload,
  }
})
