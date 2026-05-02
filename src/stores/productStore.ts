// ─────────────────────────────────────────────
// EWA Catalogue — Product Store (Pinia)
// ─────────────────────────────────────────────
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '@/services/productService'
import type { Product } from '@/types'


export const useProductStore = defineStore('products', () => {
  // ── State ────────────────────────────────────
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  // ── Getters ──────────────────────────────────
  const filteredProducts = computed(() => {
    if (!searchQuery.value.trim()) return products.value
    const q = searchQuery.value.toLowerCase()
    return products.value.filter(p => p.title.toLowerCase().includes(q))
  })

  const featuredProducts = computed(() =>
    products.value.filter(p => p.featured).slice(0, 4)
  )

  const totalCount = computed(() => products.value.length)

  // ── Actions ──────────────────────────────────
  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await productService.getAll()
      products.value =res.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load products.'
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id: string) {
    loading.value = true
    error.value = null
    currentProduct.value = null
    try {
      const product = await productService.getById(id)
      if (!product) throw new Error('Product not found.')
      currentProduct.value = product
    } catch (err: any) {
      error.value = err.message || 'Failed to load product.'
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
    // state
    products,
    currentProduct,
    loading,
    error,
    searchQuery,
    // getters
    filteredProducts,
    featuredProducts,
    totalCount,
    // actions
    fetchProducts,
    fetchProductById,
    setSearchQuery,
    clearCurrentProduct,
  }
})
