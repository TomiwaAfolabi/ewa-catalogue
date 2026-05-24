// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — HTTP client for the NestJS API (`server/`)
// Set VITE_API_BASE_URL (e.g. http://localhost:3000/api) and VITE_SITE_URL (https://www.ewaman.com)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ApiResponse,
  AuthTokens,
  AuthUser,
  CreatedOrder,
  OrdersListResponse,
  PaginatedResponse,
  EngagementPrompt,
  PaystackInitializeResponse,
  Product,
  RouteViewPayload,
} from '@/types'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3000/api'

const API_TIMEOUT = 15_000

type RequestOpts = { skipAuth?: boolean }

function nestMessage(body: Record<string, unknown>): string {
  const m = body?.message
  if (Array.isArray(m)) {
    return m
      .map((x) => (typeof x === 'string' ? x : x != null ? String(x) : ''))
      .filter(Boolean)
      .join(' ')
  }
  if (typeof m === 'string' && m.trim()) return m
  const err = body?.error
  if (typeof err === 'string' && err.trim()) return err
  const code = body?.statusCode
  if (typeof code === 'number') {
    return code === 401
      ? 'You need to sign in again.'
      : code === 403
        ? 'You do not have permission to do that.'
        : code === 404
          ? 'That resource was not found.'
          : code === 409
            ? 'That action conflicts with the current state (for example, the email may already be in use).'
            : code >= 500
              ? 'Something went wrong on the server. Please try again shortly.'
              : `Request failed (${code}).`
  }
  return 'Something went wrong. Please try again.'
}

function networkErrorMessage(err: unknown): string | null {
  if (!(err instanceof Error)) return null
  const m = err.message.toLowerCase()
  if (
    m === 'failed to fetch' ||
    m.includes('networkerror when attempting to fetch') ||
    m.includes('network request failed') ||
    m === 'load failed'
  ) {
    return 'Unable to connect. Please check your internet connection and try again.'
  }
  return null
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  opts?: RequestOpts,
): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  const token = opts?.skipAuth ? null : localStorage.getItem('ewa_access_token')
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const extra = (options.headers ?? {}) as Record<string, string>
  const headers = { ...baseHeaders, ...extra }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(nestMessage(body as Record<string, unknown>))
    }

    return { data: body as T, success: true }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    const networkMsg = networkErrorMessage(err)
    if (networkMsg) {
      throw new Error(networkMsg)
    }
    throw err
  }
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const u = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue
    u.set(k, String(v))
  }
  const s = u.toString()
  return s ? `?${s}` : ''
}

const api = {
  auth: {
    register: (payload: {
      email: string
      password: string
      firstName?: string
      lastName?: string
    }) =>
      request<AuthTokens>('/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) }, {
        skipAuth: true,
      }),

    login: (payload: { email: string; password: string }) =>
      request<AuthTokens>('/v1/auth/login', { method: 'POST', body: JSON.stringify(payload) }, {
        skipAuth: true,
      }),

    logout: (refreshToken: string) =>
      request<{ success: boolean }>(
        '/v1/auth/logout',
        { method: 'POST', body: JSON.stringify({ refreshToken }) },
      ),

    me: () => request<AuthUser>('/v1/auth/me'),

    requestPasswordReset: (payload: { email: string }) =>
      request<{ ok: boolean; message: string }>(
        '/v1/auth/password-reset/request',
        { method: 'POST', body: JSON.stringify(payload) },
        { skipAuth: true },
      ),

    confirmPasswordReset: (payload: { email: string; code: string; password: string }) =>
      request<{ ok: boolean; message: string }>(
        '/v1/auth/password-reset/confirm',
        { method: 'POST', body: JSON.stringify(payload) },
        { skipAuth: true },
      ),
  },

  products: {
    list: (params?: {
      page?: number
      perPage?: number
      categorySlug?: string
      featured?: boolean
      search?: string
    }) =>
      request<PaginatedResponse<Product>>(
        `/v1/catalogue/products${qs({
          page: params?.page,
          perPage: params?.perPage,
          categorySlug: params?.categorySlug,
          featured: params?.featured,
          search: params?.search,
        })}`,
      ),

    getByUuid: (id: string) => request<Product>(`/v1/catalogue/products/id/${id}`),

    getByCatalogueKey: (key: string) =>
      request<Product>(`/v1/catalogue/products/key/${encodeURIComponent(key)}`),

    getBySlug: (slug: string) =>
      request<Product>(`/v1/catalogue/products/slug/${encodeURIComponent(slug)}`),

    search: (q: string, limit?: number) =>
      request<Product[]>(`/v1/catalogue/products/search${qs({ q, limit })}`),

    featured: (limit?: number) =>
      request<Product[]>(`/v1/catalogue/products/featured${qs({ limit })}`),
  },

  orders: {
    list: (params?: { page?: number; perPage?: number }) =>
      request<OrdersListResponse>(
        `/v1/orders${qs({
          page: params?.page,
          perPage: params?.perPage,
        })}`,
      ),

    create: (
      payload: {
        items: {
          productId: string
          quantity: number
          expectedUnitPriceKobo: number
          selectedSize?: string
        }[]
        shippingSnapshot?: Record<string, unknown>
        notes?: string
        shippingAmount?: number
        taxAmount?: number
        guestCheckoutEmail?: string
      },
      idempotencyKey?: string,
      opts?: RequestOpts,
    ) =>
      request<CreatedOrder>(
        '/v1/orders',
        {
          method: 'POST',
          body: JSON.stringify(payload),
          ...(idempotencyKey
            ? { headers: { 'Idempotency-Key': idempotencyKey } }
            : {}),
        },
        opts,
      ),

    getOne: (orderId: string) => request<CreatedOrder & { items?: unknown[] }>(`/v1/orders/${orderId}`),
  },

  payments: {
    initializePaystack: (
      payload: {
        orderId: string
        callbackUrl?: string
        expectedOrderTotalKobo?: number
        guestCheckoutEmail?: string
      },
      idempotencyKey: string,
      opts?: RequestOpts,
    ) => {
      const body: {
        orderId: string
        callbackUrl?: string
        expectedOrderTotalKobo?: number
        guestCheckoutEmail?: string
      } = {
        orderId: payload.orderId,
      }
      if (payload.callbackUrl != null && payload.callbackUrl !== '') {
        body.callbackUrl = payload.callbackUrl
      }
      if (
        payload.expectedOrderTotalKobo != null &&
        Number.isFinite(payload.expectedOrderTotalKobo)
      ) {
        body.expectedOrderTotalKobo = Math.round(payload.expectedOrderTotalKobo)
      }
      const guestEmail = payload.guestCheckoutEmail?.trim().toLowerCase()
      if (guestEmail) {
        body.guestCheckoutEmail = guestEmail
      }
      return request<PaystackInitializeResponse>(
        '/v1/payments/paystack/initialize',
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Idempotency-Key': idempotencyKey },
        },
        opts,
      )
    },

    verifyPaystack: (reference: string) =>
      request<{
        ok: boolean
        message?: string
        paymentId?: string
        order?: { id: string; status: string; total: number }
        payment?: { status: string; paystackReference: string | null }
      }>(`/v1/payments/paystack/verify/${encodeURIComponent(reference)}`),
  },

  engagement: {
    getPrompt: () => request<EngagementPrompt | null>('/v1/engagement/prompt'),

    dismissPrompt: (promptId: string) =>
      request<{ ok: boolean }>('/v1/engagement/prompt/dismiss', {
        method: 'POST',
        body: JSON.stringify({ promptId }),
      }),
  },

  activity: {
    reportRouteView: (payload: RouteViewPayload) =>
      request<{ ok?: boolean }>('/v1/activity/route-view', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
}

export default api
export { BASE_URL }
