// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — Product Service (productService.ts)
//
// This is the FACADE layer that your components and stores call.
// It transparently serves either mock JSON (now) or real API (later).
// When your backend is ready, only this file needs to change — zero
// component rewrites needed.
// ─────────────────────────────────────────────────────────────────────────────

import api, { useMockData } from './api'
import mockProducts from '@/static/catalogue-details.json'
import type { Product, PaginatedResponse } from '@/types'

// Simulate realistic async delay in development
const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ── Mock implementations ──────────────────────────────────────────────────────

async function getMockProducts(): Promise<PaginatedResponse<Product>> {

  const products = mockProducts as Product[]
  return {
    data: products,
    total: products.length,
    page: 1,
    perPage: products.length,
    totalPages: 1,
  }
}

async function getMockProductById(id: string): Promise<Product | undefined> {
  await mockDelay(150)
  return (mockProducts as Product[]).find(p => p.id === id)
}

// ── Public service interface ──────────────────────────────────────────────────

export const productService = {
  async getAll(): Promise<PaginatedResponse<Product>> {
    if (useMockData) return getMockProducts()
    const res = await api.products.getAll()
    return res.data
  },

  async getById(id: string): Promise<Product | undefined> {
    if (useMockData) return getMockProductById(id)
    const res = await api.products.getById(id)
    return res.data
  },

  async getFeatured(): Promise<Product[]> {
    if (useMockData) {
      await mockDelay(200)
      return (mockProducts as Product[]).slice(0, 4)
    }
    const res = await api.products.getFeatured()
    return res.data
  },

  async search(query: string): Promise<Product[]> {
    if (useMockData) {
      await mockDelay(200)
      const q = query.toLowerCase()
      return (mockProducts as Product[]).filter(p =>
        p.title.toLowerCase().includes(q)
      )
    }
    const res = await api.products.search(query)
    return res.data
  },
}
