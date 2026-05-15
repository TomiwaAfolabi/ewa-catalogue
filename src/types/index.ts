// ─────────────────────────────────────────────
// EWA Catalogue — Shared TypeScript Types
// All types are defined here so a backend swap
// only requires updating the service layer.
// ─────────────────────────────────────────────

export type GarmentType = 'SHIRT' | 'TROUSER'

/** Merged JSON from API: cm fields optional; garmentType required when editing garment fields. */
export interface ProductSizes {
  garmentType?: GarmentType | string
  chestWidthCm?: number | string
  sleeveLengthCm?: number | string
  shirtLengthCm?: number | string
  waistCm?: number | string
  trouserLengthCm?: number | string
  /** Legacy string keys (older catalogue rows) */
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
  /** Legacy catalogue id from JSON (e.g. "04") when using the API + seed */
  catalogueKey?: string | null
  slug?: string
  title: string
  imgSrc: string
  images: string[]
  price: number
  /** From API — authoritative; required for checkout price checks. */
  priceKobo?: number
  currency_symbol: string
  sizes: ProductSizes
  /** When set, drives shirt vs trouser measurement labels (also may appear under sizes.garmentType). */
  garmentType?: GarmentType | null
  category?: string
  inStock?: boolean
  /** Units available (from API). When absent, UI treats `inStock` as 0 or 1 unit. */
  stockQuantity?: number
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

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface AuthUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  role?: string
}

export interface CreatedOrder {
  id: string
  status: string
  currency: string
  /** Amounts in smallest currency unit (kobo for NGN), same as Prisma `Order`. */
  subtotal: number
  shippingAmount: number
  taxAmount: number
  total: number
}

/** Line on a persisted order (from `GET /v1/orders`) */
export interface UserOrderItem {
  id: string
  title: string
  unitPrice: number
  quantity: number
  selectedSize?: string | null
  productId?: string | null
}

export interface UserOrderPayment {
  id: string
  status: string
  provider?: string
}

/** Order summary returned by `GET /v1/orders` */
export interface UserOrder {
  id: string
  status: string
  currency: string
  subtotal: number
  shippingAmount: number
  taxAmount: number
  total: number
  createdAt: string
  notes?: string | null
  items?: UserOrderItem[]
  payments?: UserOrderPayment[]
}

export interface OrdersListResponse {
  data: UserOrder[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface PaystackInitializeResponse {
  authorizationUrl: string
  accessCode: string
  reference: string
  replayed: boolean
}
