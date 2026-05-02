// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — HTTP Client (api.ts)
//
// This is the single integration point for your future backend.
// When your backend is ready:
//   1. Set VITE_API_BASE_URL in your .env file
//   2. The `useMockData` flag below will switch automatically
//   3. No component or store code changes needed
// ─────────────────────────────────────────────────────────────────────────────

import type { ApiResponse, PaginatedResponse, Product } from '@/types'

// Switch this to false (or use env var) when backend is ready
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const API_TIMEOUT = 10_000

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Auth header will be injected here once backend is ready:
        // ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return { data, success: true }
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.')
    }
    throw err
  }
}

// ── API methods — these are the real backend endpoints ───────────────────────

const api = {
  products: {
    getAll: (params?: { page?: number; perPage?: number; category?: string }) =>
      request<PaginatedResponse<Product>>('/products', {
        method: 'GET',
      }),

    getById: (id: string) =>
      request<Product>(`/products/${id}`),

    search: (query: string) =>
      request<Product[]>(`/products/search?q=${encodeURIComponent(query)}`),

    getFeatured: () =>
      request<Product[]>('/products/featured'),
  },

  orders: {
    create: (payload: { items: { productId: string; quantity: number }[]; contact: string }) =>
      request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  },
}

export default api
export { useMockData }
