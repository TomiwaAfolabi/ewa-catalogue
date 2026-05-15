import type { Product } from '@/types'

/** Derive sellable quantity from API fields (supports future `stockQuantity`; else boolean `inStock`). */
export function inferStockQuantity(product: unknown): number {
  if (!product || typeof product !== 'object') return 0
  const p = product as Record<string, unknown>
  const sq = p.stockQuantity ?? p.stock_quantity ?? p.quantityInStock
  if (typeof sq === 'number' && Number.isFinite(sq)) return Math.max(0, Math.floor(sq))
  if (typeof sq === 'string') {
    const n = Number.parseInt(sq.trim(), 10)
    if (Number.isFinite(n)) return Math.max(0, n)
  }
  if (p.inStock === false) return 0
  if (p.inStock === true) return 1
  return 1
}

export function productStockQuantity(product: Product | undefined | null): number {
  if (!product) return 0
  if (typeof product.stockQuantity === 'number' && Number.isFinite(product.stockQuantity)) {
    return Math.max(0, Math.floor(product.stockQuantity))
  }
  return inferStockQuantity(product)
}

export function canPurchaseProduct(product: Product | undefined | null): boolean {
  return productStockQuantity(product) > 0
}
