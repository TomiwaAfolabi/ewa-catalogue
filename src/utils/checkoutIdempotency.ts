import type { CartItem } from '@/types'

/** Idempotency-Key for POST /v1/orders (one per checkout attempt / cart snapshot). */
export const ORDER_IDEM_STORAGE = 'ewa_checkout_order_idempotency'
/** Cart fingerprint bound to the order idempotency key. */
export const ORDER_IDEM_CART_FP_STORAGE = 'ewa_checkout_order_idempotency_cart_fp'

const PAY_IDEM_PREFIX = 'ewa_checkout_pay_idempotency_'

/** Stable signature of bag contents for rotating idempotency keys when the cart changes. */
export function cartCheckoutFingerprint(
  items: CartItem[],
  checkoutEmail?: string,
): string {
  const lines = items
    .map((i) => `${i.product.id}:${i.quantity}:${i.selectedSize ?? ''}`)
    .sort()
    .join('|')
  const email = checkoutEmail?.trim().toLowerCase()
  return email ? `${lines}|email:${email}` : lines
}

/**
 * Mint or reuse the order idempotency key for this cart snapshot.
 * Call when checkout opens and whenever cart lines change.
 */
export function ensureOrderIdempotencyKey(cartFingerprint: string): string {
  const storedFp = sessionStorage.getItem(ORDER_IDEM_CART_FP_STORAGE)
  const storedKey = sessionStorage.getItem(ORDER_IDEM_STORAGE)
  if (storedKey && storedFp === cartFingerprint) return storedKey

  const key = crypto.randomUUID()
  sessionStorage.setItem(ORDER_IDEM_STORAGE, key)
  sessionStorage.setItem(ORDER_IDEM_CART_FP_STORAGE, cartFingerprint)
  return key
}

export function getOrCreatePayIdempotencyKey(orderId: string): string {
  const storageKey = `${PAY_IDEM_PREFIX}${orderId}`
  const existing = sessionStorage.getItem(storageKey)
  if (existing) return existing
  const key = crypto.randomUUID()
  sessionStorage.setItem(storageKey, key)
  return key
}

/** Clear checkout idempotency state after successful payment or explicit abandon. */
export function clearCheckoutIdempotencyKeys(): void {
  sessionStorage.removeItem(ORDER_IDEM_STORAGE)
  sessionStorage.removeItem(ORDER_IDEM_CART_FP_STORAGE)
  sessionStorage.removeItem('ewa_checkout_order_id')
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i)
    if (k?.startsWith(PAY_IDEM_PREFIX)) sessionStorage.removeItem(k)
  }
}
