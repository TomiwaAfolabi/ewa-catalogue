import type { Product } from '@/types'

/** Authoritative smallest-unit price from the catalogue API (kobo for NGN). */
export function productUnitPriceKobo(p: Product): number {
  if (typeof p.unitPriceKobo === 'number' && Number.isFinite(p.unitPriceKobo)) {
    return Math.round(p.unitPriceKobo)
  }
  if (typeof p.priceKobo === 'number' && Number.isFinite(p.priceKobo)) {
    return Math.round(p.priceKobo)
  }
  return 0
}

/** Exact naira amount for a line (no rounding) — matches Paystack charge. */
export function productLineTotalNaira(p: Product, quantity: number): number {
  return (productUnitPriceKobo(p) * quantity) / 100
}

export function cartTotalKobo(items: { product: Product; quantity: number }[]): number {
  return items.reduce(
    (sum, item) => sum + productUnitPriceKobo(item.product) * item.quantity,
    0,
  )
}

/** Format kobo as NGN for display (2 decimals when not a whole naira). */
export function formatNairaFromKobo(kobo: number, symbol = '₦'): string {
  const naira = kobo / 100
  const formatted = Number.isInteger(naira)
    ? naira.toLocaleString('en-NG')
    : naira.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  return `${symbol}\u00a0${formatted}`
}

/** Format a naira amount (may include kobo fractions). */
export function formatNairaAmount(naira: number, symbol = '₦'): string {
  const rounded = Math.round(naira * 100) / 100
  const formatted = Number.isInteger(rounded)
    ? rounded.toLocaleString('en-NG')
    : rounded.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  return `${symbol}\u00a0${formatted}`
}

/** Display price for a catalogue product — always derived from kobo. */
export function formatProductPrice(p: Product): string {
  const kobo = productUnitPriceKobo(p)
  if (kobo > 0) return formatNairaFromKobo(kobo, p.currency_symbol || '₦')
  return formatNairaAmount(p.price, p.currency_symbol || '₦')
}
