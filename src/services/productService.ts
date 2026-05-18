// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — Product facade (Nest API only)
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'
import type { Product, PaginatedResponse } from '@/types'
import { extractProductSizesInput, normalizeGarmentSizes, normalizeGarmentType } from '@/utils/measurements'
import { inferStockQuantity } from '@/utils/inventory'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function mapProduct(p: Product): Product {
  const raw = p as unknown as Record<string, unknown>
  const topGt = normalizeGarmentType(raw.garmentType ?? raw.garment_type)
  return {
    ...p,
    sizes: normalizeGarmentSizes(extractProductSizesInput(p)),
    stockQuantity: inferStockQuantity(p),
    ...(topGt ? { garmentType: topGt } : {}),
  }
}

export const productService = {
  async getAll(params?: {
    page?: number
    perPage?: number
    search?: string
    categorySlug?: string
    featured?: boolean
  }): Promise<PaginatedResponse<Product>> {
    const res = await api.products.list(params)
    return {
      ...res.data,
      data: res.data.data.map(mapProduct),
    }
  },

  async getById(id: string): Promise<Product | undefined> {
    try {
      if (UUID_RE.test(id)) {
        const res = await api.products.getByUuid(id)
        return mapProduct(res.data)
      }
      const res = await api.products.getByCatalogueKey(id)
      return mapProduct(res.data)
    } catch {
      return undefined
    }
  },

  async getFeatured(): Promise<Product[]> {
    const res = await api.products.featured(8)
    return res.data.map(mapProduct)
  },

  async search(query: string): Promise<Product[]> {
    const q = query.trim()
    if (!q) return []
    const res = await api.products.search(q)
    return res.data.map(mapProduct)
  },
}
