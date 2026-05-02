<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import CatalogueCard from './CatalogueCard.vue'
import type { Product } from '@/types'

const router = useRouter()
const productStore = useProductStore()

onMounted(() => {
  if (!productStore.products.length) {
    productStore.fetchProducts()
  }
})

function openProduct(product: Product) {
  router.push({ name: 'catalogue-detail', params: { id: product.id } })
}
</script>

<template>
  <section class="catalogue-section">
    <!-- Header -->
    <div class="catalogue-header">
      <span class="section-label">The Collection</span>
      <h2 class="catalogue-title">Men's <em>Linen</em> Pieces</h2>
      <p class="catalogue-subtitle">
        Crafted for the man who wears culture with intention.
      </p>
    </div>

    <!-- Search -->
    <div class="search-row">
      <div class="search-field">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          placeholder="Search pieces..."
          :value="productStore.searchQuery"
          @input="productStore.setSearchQuery(($event.target as HTMLInputElement).value)"
          class="search-input"
          aria-label="Search catalogue"
        />
      </div>
      <span class="results-count">
        {{ productStore.filteredProducts.length }} pieces
      </span>
    </div>

    <!-- Loading state -->
    <div v-if="productStore.loading" class="state-container">
      <div class="skeleton-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-img" />
          <div class="skeleton-line" />
          <div class="skeleton-line skeleton-line--short" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="productStore.error" class="state-container state-error">
      <p class="error-message">{{ productStore.error }}</p>
      <button class="btn-ghost" @click="productStore.fetchProducts()">Try again</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!productStore.filteredProducts.length" class="state-container">
      <p class="empty-message">No pieces found for "{{ productStore.searchQuery }}"</p>
      <button class="btn-ghost" @click="productStore.setSearchQuery('')">Clear search</button>
    </div>

    <!-- Product grid -->
    <div v-else class="product-grid">
      <CatalogueCard
        v-for="product in productStore.filteredProducts"
        :key="product.id"
        :product="product"
        @click="openProduct"
      />
    </div>
  </section>
</template>

<style scoped>
.catalogue-section {
  width: 100%;
  padding: 60px 48px;
  min-height: 100vh;
}

/* ── Header ─────────────────────── */
.catalogue-header {
  text-align: center;
  margin-bottom: 48px;
}

.catalogue-title {
  font-family: var(--font-serif);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  color: var(--ivory);
  margin-bottom: 12px;
}

.catalogue-title em {
  font-style: italic;
  color: var(--terra);
}

.catalogue-subtitle {
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 300;
}

/* ── Search ─────────────────────── */
.search-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  gap: 16px;
}

.search-field {
  position: relative;
  flex: 1;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: rgba(250, 246, 239, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.2);
  padding: 10px 14px 10px 40px;
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--ivory);
  outline: none;
  border-radius: var(--radius-sm);
  transition: border-color var(--transition-base);
}

.search-input::placeholder { color: var(--muted); }
.search-input:focus { border-color: var(--terra); }

.results-count {
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}

/* ── Product grid ───────────────── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px 24px;
}

/* ── Loading skeleton ───────────── */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px 24px;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-img {
  aspect-ratio: 3 / 4;
  background: rgba(250, 246, 239, 0.07);
  border-radius: var(--radius-sm);
  animation: shimmer 1.6s ease-in-out infinite;
}

.skeleton-line {
  height: 12px;
  border-radius: 4px;
  background: rgba(250, 246, 239, 0.07);
  animation: shimmer 1.6s ease-in-out infinite;
}
.skeleton-line--short { width: 60%; }

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

/* ── State containers ───────────── */
.state-container {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.error-message,
.empty-message {
  font-size: 14px;
  color: var(--muted);
  letter-spacing: 0.05em;
}

/* ── Responsive ─────────────────── */
@media (max-width: 1024px) {
  .product-grid,
  .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .catalogue-section { padding: 40px 20px; }
  .product-grid,
  .skeleton-grid { grid-template-columns: 1fr; }
  .search-row { flex-direction: column; align-items: flex-start; }
  .search-field { max-width: 100%; width: 100%; }
}
</style>
