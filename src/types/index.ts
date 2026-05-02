// ─────────────────────────────────────────────
// EWA Catalogue — Shared TypeScript Types
// All types are defined here so a backend swap
// only requires updating the service layer.
// ─────────────────────────────────────────────

export interface ProductSizes {
  length?: string
  waist?: string
  shirtlength?: string
  thighWidth?: string
  shoulder?: string
  chest?: string
  armWidth?: string
  armLength?: string
}

export interface Product {
  id: string
  title: string
  imgSrc: string
  images: string[]
  price: number
  currency_symbol: string
  sizes: ProductSizes
  category?: string
  inStock?: boolean
  featured?: boolean
  description?: string
  createdAt?: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type NavLink = {
  name: string
  label: string
  path: string
  icon?: string
}
