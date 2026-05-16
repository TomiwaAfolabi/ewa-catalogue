// ─────────────────────────────────────────────────────────────────────────────
// Reports a single product page view per route param (POST /v1/activity/route-view).
// JWT is sent when present so unique users can be counted.
// ─────────────────────────────────────────────────────────────────────────────
import { ref, watch, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import api from '@/services/api'
import type { Product, RouteViewPayload } from '@/types'

function buildPayload(route: RouteLocationNormalizedLoaded, product: Product | null): RouteViewPayload {
  const paramId = String(route.params.id ?? '').trim()
  const payload: RouteViewPayload = {
    route: route.path,
  }

  const catalogueKey = product?.catalogueKey?.trim() || paramId
  if (catalogueKey) payload.catalogueKey = catalogueKey

  const slug = product?.slug?.trim()
  if (slug) payload.slug = slug

  if (product?.id) payload.productId = product.id

  return payload
}

/**
 * Call once per product id when the detail page loads or the `:id` param changes.
 * Pass a ref/computed to the loaded product so `productId` / `slug` are included when available.
 */
export function useProductRouteView(
  route: RouteLocationNormalizedLoaded,
  product: Ref<Product | null>,
  loadProduct: (id: string) => Promise<void>,
) {
  const reportedForParam = ref<string | null>(null)

  async function reportOnce(paramId: string) {
    if (!paramId || reportedForParam.value === paramId) return

    try {
      await api.activity.reportRouteView(buildPayload(route, product.value))
      reportedForParam.value = paramId
    } catch {
      /* Non-blocking analytics — ignore throttle/network errors. */
    }
  }

  watch(
    () => route.params.id as string | undefined,
    (paramId, prev) => {
      if (!paramId || paramId === prev) return

      reportedForParam.value = null

      void (async () => {
        await loadProduct(paramId)
        await reportOnce(paramId)
      })()
    },
    { immediate: true },
  )
}
