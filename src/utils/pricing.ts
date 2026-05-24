import type { Product } from '@/types'

/** Authoritative smallest-unit price from the catalogue API (kobo for NGN). */
export function productUnitPriceKobo(p: Product): number {
  if (typeof p.unitPriceKobo === 'number' && Number.isFinite(p.unitPriceKobo)) {
    return Math.round(p.unitPriceKobo)
  }
  return 0
}

/** Whole naira (rounded) for a cart line — derived from `unitPriceKobo` only. */
export function productLineTotalNaira(p: Product, quantity: number): number {
  return Math.round((productUnitPriceKobo(p) * quantity) / 100)
}
