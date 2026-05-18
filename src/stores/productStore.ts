// ─────────────────────────────────────────────
// EWA Catalogue — Product Store (Pinia)
// ─────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CATALOGUE_PAGE_SIZE } from '@/config/site'
import { productService } from '@/services/productService'
import type { Product } from '@/types'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const spotlightProducts = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const spotlightLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const page = ref(1)
  const perPage = ref(CATALOGUE_PAGE_SIZE)
  const total = ref(0)
  const totalPages = ref(0)

  const filteredProducts = computed(() => products.value)

  const featuredProducts = computed(() =>
    products.value.filter(p => p.featured).slice(0, 4),
  )

  const totalCount = computed(() => total.value)

  async function fetchCataloguePage(targetPage = 1, search?: string) {
    loading.value = true
    error.value = null
    const q = (search ?? searchQuery.value).trim()
    try {
      const res = await productService.getAll({
        page: targetPage,
        perPage: CATALOGUE_PAGE_SIZE,
        search: q || undefined,
      })
      products.value = res.data
      page.value = res.page
      perPage.value = res.perPage
      total.value = res.total
      totalPages.value = res.totalPages
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load products.'
      error.value = message
    } finally {
      loading.value = false
    }
  }

  /** Homepage / profile — featured in-stock pieces only. */
  async function fetchSpotlightProducts() {
    spotlightLoading.value = true
    try {
      spotlightProducts.value = await productService.getFeatured()
    } catch {
      spotlightProducts.value = []
    } finally {
      spotlightLoading.value = false
    }
  }

  /** @deprecated Use fetchCataloguePage — kept for existing call sites during transition */
  async function fetchProducts() {
    return fetchCataloguePage(1)
  }

  async function fetchProductById(id: string) {
    loading.value = true
    error.value = null
    currentProduct.value = null
    try {
      const product = await productService.getById(id)
      if (!product) throw new Error('Product not found.')
      currentProduct.value = product
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load product.'
    } finally {
      loading.value = false
    }
  }

  function setSearchQuery(q: string) {
    searchQuery.value = q
  }

  function clearCurrentProduct() {
    currentProduct.value = null
  }

  return {
    products,
    spotlightProducts,
    currentProduct,
    loading,
    spotlightLoading,
    error,
    searchQuery,
    page,
    perPage,
    total,
    totalPages,
    filteredProducts,
    featuredProducts,
    totalCount,
    fetchCataloguePage,
    fetchSpotlightProducts,
    fetchProducts,
    fetchProductById,
    setSearchQuery,
    clearCurrentProduct,
  }
})
