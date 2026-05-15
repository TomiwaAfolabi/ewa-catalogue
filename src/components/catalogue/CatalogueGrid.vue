<!--
  CatalogueGrid.vue
  ─────────────────────────────────────────────────────────────────
  WCAG / HCD compliance:
  • <section> with aria-labelledby (WCAG 1.3.6 landmark)
  • <h1> on the catalogue page (WCAG 2.4.6 — each page has a heading)
  • role="status" aria-live="polite" for results count (WCAG 4.1.3)
  • role="alert" aria-live="assertive" for error (WCAG 4.1.3)
  • aria-busy="true" on loading state (WCAG 4.1.3)
  • Skeleton cards hidden from AT via aria-hidden (WCAG 1.3.1)
  • Search <label> paired to input via for/id (WCAG 1.3.1 + 2.5.3)
  • Sort <label> paired to select (WCAG 1.3.1)
  • Grid items stagger-animate in with animation-delay (delight, not WCAG required)
  • Focus after clearing search returns to input (WCAG 2.4.3 focus order)
-->

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import CatalogueCard from './CatalogueCard.vue'
import EwaPageSpinner from '@/components/ui/EwaPageSpinner.vue'
import type { Product } from '@/types'

const router       = useRouter()
const productStore = useProductStore()
const searchInput  = ref<HTMLInputElement | null>(null)
const gridEl       = ref<HTMLElement | null>(null)

const sortBy = ref<'default' | 'price-asc' | 'price-desc'>('default')

onMounted(() => {
  if (!productStore.products.length) productStore.fetchProducts()
})

const sortedProducts = computed(() => {
  const base = productStore.filteredProducts
  if (sortBy.value === 'price-asc')  return [...base].sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') return [...base].sort((a, b) => b.price - a.price)
  return base
})

function openProduct(product: Product) {
  router.push({
    name: 'catalogue-detail',
    params: { id: (product.catalogueKey ?? product.id).toString() },
  })
}

function clearSearch() {
  productStore.setSearchQuery('')
  searchInput.value?.focus()   // return focus to input after clearing
}

function skipToGrid() {
  gridEl.value?.focus()
}
</script>

<template>
  <section
    class="catalogue-section"
    aria-labelledby="cat-heading"
    aria-describedby="cat-desc"
  >

    <!-- ── Decorative top accent ──────────────────── -->
    <div class="section-glow" aria-hidden="true" />

    <!-- ── Header ────────────────────────────────── -->
    <header class="catalogue-header">
      <p class="section-label" aria-hidden="true">The Collection</p>
      <h1 id="cat-heading" class="catalogue-title">
        Men's <em>Linen</em> Pieces
      </h1>
      <p class="catalogue-subtitle" id="cat-desc">
        Crafted for the man who wears culture with intention.
      </p>

      <!-- Decorative horizontal rule -->
      <div class="header-rule" aria-hidden="true">
        <span class="rule-line" />
        <svg class="rule-ornament" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
          <path d="M12 2 L14 6 L12 10 L10 6 Z"/>
          <path d="M12 14 L14 18 L12 22 L10 18 Z"/>
          <path d="M2 12 L6 10 L10 12 L6 14 Z"/>
          <path d="M14 12 L18 10 L22 12 L18 14 Z"/>
        </svg>
        <span class="rule-line" />
      </div>
    </header>

    <!-- ── Main region: tools + results ───────── -->
    <div class="catalogue-main">

    <!-- ── Toolbar — search + sort + count ───────── -->
    <div class="toolbar" role="search" aria-label="Search and sort the catalogue">

      <!-- Search -->
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15" aria-hidden="true">
          <circle cx="10" cy="10" r="7"/>
          <path d="m17 17-3.5-3.5"/>
        </svg>

        <label for="cat-search" class="sr-only">Search pieces by name</label>
        <input
          id="cat-search"
          ref="searchInput"
          type="search"
          placeholder="Search pieces…"
          class="search-input"
          :value="productStore.searchQuery"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          :aria-describedby="productStore.searchQuery ? 'search-status' : undefined"
          @input="productStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        />

        <Transition name="fade">
          <button
            v-if="productStore.searchQuery"
            class="search-clear"
            @click="clearSearch"
            aria-label="Clear search"
            title="Clear search"
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12"/>
            </svg>
          </button>
        </Transition>
      </div>

      <!-- Sort -->
      <div class="sort-wrap">
        <svg class="sort-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4" width="13" height="13" aria-hidden="true">
          <path d="M2 4h14M4 9h10M7 14h4"/>
        </svg>
        <label for="cat-sort" class="sr-only">Sort products</label>
        <select
          id="cat-sort"
          class="sort-select"
          v-model="sortBy"
          aria-label="Sort products"
        >
          <option value="default">Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        <svg class="sort-caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10" aria-hidden="true">
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </div>

      <!-- Live results count — WCAG 4.1.3 status message -->
      <p
        id="search-status"
        class="results-count"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span class="results-num">{{ sortedProducts.length }}</span>
        {{ sortedProducts.length === 1 ? 'piece' : 'pieces' }}
      </p>
    </div>

    <!-- ── Loading skeleton ───────────────────────── -->
    <div
      v-if="productStore.loading"
      class="grid-panel grid-panel--busy"
      role="status"
      aria-label="Loading products"
      aria-busy="true"
    >
      <div class="grid-panel__intro grid-panel__intro--loading">
        <EwaPageSpinner
          size="lg"
          label="Loading products. Please wait."
          message="Curating the collection"
        />
      </div>
      <div class="skeleton-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card" aria-hidden="true">
        <div class="sk-img">
          <div class="sk-shimmer" />
        </div>
        <div class="sk-body">
          <div class="sk-line sk-line--title" />
          <div class="sk-line sk-line--price" />
          <div class="sk-line sk-line--bullet" />
          <div class="sk-line sk-line--bullet" />
          <div class="sk-line sk-line--bullet" />
        </div>
        </div>
      </div>
    </div>

    <!-- ── Error state ────────────────────────────── -->
    <div
      v-else-if="productStore.error"
      class="state-card"
      role="alert"
      aria-live="assertive"
    >
      <svg class="state-icon state-icon--error" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
        <circle cx="20" cy="20" r="18"/>
        <path d="M20 12v10M20 28h.01" stroke-width="1.5"/>
      </svg>
      <p class="state-title">Couldn't load the collection</p>
      <p class="state-body">{{ productStore.error }}</p>
      <button class="state-btn" @click="productStore.fetchProducts()">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14" aria-hidden="true">
          <path d="M3.5 9a5.5 5.5 0 1 1 .8 2.8"/>
          <path d="M3.5 12.5v-4h4"/>
        </svg>
        Try again
      </button>
    </div>

    <!-- ── Empty state ────────────────────────────── -->
    <div
      v-else-if="!sortedProducts.length"
      class="state-card"
      role="status"
      aria-live="polite"
    >
      <svg class="state-icon state-icon--empty" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke-dasharray="4 3" opacity="0.5"/>
        <path d="M16 32l4-8 4 4 4-6 4 10" stroke-width="1.2" opacity="0.4"/>
      </svg>
      <p class="state-title">No pieces found</p>
      <p class="state-body">
        We couldn't find anything matching
        "<strong>{{ productStore.searchQuery }}</strong>"
      </p>
      <button class="state-btn" @click="clearSearch">
        Clear search
      </button>
    </div>

    <!-- ── Product grid (raised panel — visibility of grouping, Nielsen) ───────── -->
    <div
      v-else
      class="grid-panel"
      aria-labelledby="grid-panel-heading"
    >
      <div class="grid-panel__intro">
        <svg class="grid-panel__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" width="18" height="18" aria-hidden="true">
          <rect x="2.5" y="2.5" width="6" height="6" rx="1"/>
          <rect x="11.5" y="2.5" width="6" height="6" rx="1"/>
          <rect x="2.5" y="11.5" width="6" height="6" rx="1"/>
          <rect x="11.5" y="11.5" width="6" height="6" rx="1"/>
        </svg>
        <h2 id="grid-panel-heading" class="grid-panel__title">
          Browse pieces
        </h2>
        <a href="#product-grid" class="grid-panel__skip" @click.prevent="skipToGrid">
          Skip to grid
          <span class="sr-only">, product list</span>
        </a>
      </div>
    
      <div
        id="product-grid"
        ref="gridEl"
        class="product-grid "
        role="list"
        tabindex="-1"
        aria-describedby="grid-panel-desc"
        :aria-label="`${sortedProducts.length} product${sortedProducts.length === 1 ? '' : 's'} in the collection`"
      >
        <div
          v-for="(product, i) in sortedProducts"
          :key="(product.catalogueKey ?? product.id).toString()"
          role="listitem"
          class="grid-item"
          :style="{ '--delay': `${Math.min(i * 55, 400)}ms` }"
        >
          <CatalogueCard :product="product" @click="openProduct" />
        </div>
      </div>
    </div>

    </div>
    <!-- /catalogue-main -->

  </section>
</template>

<style scoped>
/* ── Screen-reader only ─────────────────────────────── */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* ── Section wrapper ────────────────────────────────── */
.catalogue-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 64px 52px 88px;
  overflow: hidden;
}

/* ── Collection panel (groups grid + reinforces hierarchy) ─ */
.grid-panel {
  background: rgba(18, 12, 9, 0.72);
  border: 1px solid rgba(201, 168, 76, 0.16);
  border-radius: calc(var(--radius-md) + 2px);
  padding: 22px 22px 26px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.28),
    0 18px 48px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(201, 168, 76, 0.1);
}

.grid-panel--busy {
  border-style: dashed;
  border-color: rgba(201, 168, 76, 0.12);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(201, 168, 76, 0.06);
}

.grid-panel__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin-bottom: 8px;
}

.grid-panel__intro--loading {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  gap: 0;
}

.grid-panel__icon {
  flex-shrink: 0;
  color: rgba(201, 168, 76, 0.55);
}

.grid-panel__title {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.72);
}

.grid-panel__label {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(139, 115, 85, 0.85);
}

.grid-panel__skip {
  margin-left: auto;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(181, 82, 42, 0.85);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.grid-panel__skip:hover {
  color: var(--terra-light);
}
.grid-panel__skip:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
  border-radius: 2px;
}

.grid-panel__desc {
  margin: 0 0 22px;
  max-width: 52ch;
  font-family: var(--font-sans);
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.03em;
  color: rgba(139, 115, 85, 0.88);
}

/* Top radial glow — creates atmosphere without noise */
.section-glow {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 400px;
  background: radial-gradient(
    ellipse at center,
    rgba(201, 168, 76, 0.07) 0%,
    rgba(181, 82, 42, 0.04) 40%,
    transparent 70%
  );
  pointer-events: none;
}

/* ── Header ─────────────────────────────────────────── */
.catalogue-header {
  text-align: center;
  margin-bottom: 15px;
  position: relative;
}

.catalogue-title {
  font-family: var(--font-serif);
  font-size: clamp(40px, 5.5vw, 66px);
  font-weight: 300;
  color: var(--ivory);
  line-height: 1.05;
  margin-bottom: 12px;
}
.catalogue-title em { font-style: italic; color: var(--terra); }

.catalogue-subtitle {
  font-size: 11.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 300;
  margin-bottom: 32px;
}

/* Ornamental rule beneath subtitle */
.header-rule {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
}
.rule-line {
  display: block;
  width: 80px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(201, 168, 76, 0.4));
}
.rule-line:last-child {
  background: linear-gradient(to left, transparent, rgba(201, 168, 76, 0.4));
}
.rule-ornament {
  width: 20px;
  height: 20px;
  color: rgba(201, 168, 76, 0.5);
  flex-shrink: 0;
}

/* ── Toolbar ────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 44px;
  flex-wrap: wrap;

  /* Contained glass panel — Nielsen: group related controls */
  background: rgba(28, 19, 16, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(201, 168, 76, 0.06);
}

/* Search field */
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 340px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--muted);
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  background: rgba(250, 246, 239, 0.05);
  border: 1px solid rgba(201, 168, 76, 0.16);
  padding: 9px 36px 9px 36px;
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ivory);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
  /* remove native search cancel button to use our custom one */
  -webkit-appearance: none;
}
.search-input::placeholder { color: rgba(139, 115, 85, 0.6); }
.search-input:focus {
  border-color: var(--terra);
  background: rgba(250, 246, 239, 0.08);
  box-shadow: 0 0 0 3px rgba(181, 82, 42, 0.15);
}

.search-clear {
  position: absolute;
  right: 10px;
  background: rgba(250, 246, 239, 0.08);
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background 0.2s;
}
.search-clear:hover { color: var(--ivory); background: rgba(250, 246, 239, 0.14); }
.search-clear:focus-visible { outline: 2px solid var(--terra); outline-offset: 2px; }

/* Fade transition for clear button */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Sort dropdown */
.sort-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sort-icon {
  position: absolute;
  left: 10px;
  color: var(--muted);
  pointer-events: none;
}

.sort-select {
  width: 100%;
  appearance: none;
  background: rgba(250, 246, 239, 0.05);
  border: 1px solid rgba(201, 168, 76, 0.16);
  padding: 9px 30px 9px 30px;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ivory);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
  transition: border-color 0.22s, box-shadow 0.22s;
}
.sort-select:focus {
  border-color: var(--terra);
  box-shadow: 0 0 0 3px rgba(181, 82, 42, 0.15);
}
.sort-select option { background: var(--ink); color: var(--ivory); }

.sort-caret {
  position: absolute;
  right: 9px;
  color: var(--muted);
  pointer-events: none;
}

/* Live results count */
.results-count {
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
  margin-left: auto;
}
.results-num {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 300;
  color: var(--gold);
  margin-right: 5px;
  letter-spacing: 0;
}

/* ── Product grid ───────────────────────────────────── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 28px 22px;
  justify-content: center;
  outline: none; /* managed via tabindex=-1 + focusable children */
  margin-top: 30px;
}

/* Staggered entrance animation — disabled when user prefers reduced motion (WCAG 2.3.3) */
.grid-item {
  animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0ms);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .grid-item {
    animation: none;
  }
}

/* ── Loading skeleton ───────────────────────────────── */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 28px 22px;
  justify-content: center;
}

.skeleton-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(28, 19, 16, 0.55);
  border: 1px solid rgba(201, 168, 76, 0.08);
}

.sk-img {
  aspect-ratio: 3 / 4;
  position: relative;
  overflow: hidden;
  background: rgba(250, 246, 239, 0.04);
}

/* Moving shimmer (more realistic than opacity pulse) */
.sk-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(250, 246, 239, 0.07) 40%,
    rgba(250, 246, 239, 0.12) 50%,
    rgba(250, 246, 239, 0.07) 60%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: skShimmer 1.9s ease-in-out infinite;
}
@keyframes skShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .sk-shimmer,
  .sk-line {
    animation: none;
  }
}

.sk-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }

.sk-line {
  border-radius: 4px;
  background: rgba(250, 246, 239, 0.06);
  animation: skShimmer 1.9s ease-in-out infinite;
}
.sk-line--title  { height: 13px; width: 85%; animation-delay: 0.1s; }
.sk-line--price  { height: 17px; width: 45%; background: rgba(201, 168, 76, 0.08); animation-delay: 0.15s; }
.sk-line--bullet { height: 10px; width: 75%; animation-delay: 0.2s; }
.sk-line--bullet:nth-child(4) { width: 65%; animation-delay: 0.25s; }
.sk-line--bullet:nth-child(5) { width: 70%; animation-delay: 0.3s; }

/* ── State cards (error / empty) ────────────────────── */
.state-card {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;

  background: rgba(28, 19, 16, 0.45);
  border: 1px solid rgba(201, 168, 76, 0.1);
  border-radius: var(--radius-md);
  padding: 56px 40px;
}

.state-icon { opacity: 0.5; }
.state-icon--error { color: var(--terra-light); }
.state-icon--empty { color: var(--gold); }

.state-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 300;
  color: var(--ivory);
}

.state-body {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
  letter-spacing: 0.04em;
  max-width: 340px;
}
.state-body strong { color: var(--terra-light); font-weight: 500; }

.state-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(181, 82, 42, 0.12);
  border: 1px solid rgba(181, 82, 42, 0.28);
  color: var(--terra-light);
  padding: 10px 24px;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: var(--radius-sm);
  margin-top: 6px;
  transition: background 0.22s, border-color 0.22s;
}
.state-btn:hover {
  background: rgba(181, 82, 42, 0.22);
  border-color: rgba(181, 82, 42, 0.48);
}
.state-btn:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 640px) {
  .catalogue-section { padding: 40px 16px 64px; }
  .grid-panel { padding: 16px 14px 20px; }
  .grid-panel__skip {
    margin-left: 0;
    width: 100%;
    text-align: right;
  }
  .product-grid,
  .skeleton-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .toolbar { flex-direction: column; align-items: stretch; gap: 20px; }
  .search-wrap { max-width: 100%; }
  .results-count { margin-left: 0; }
}
</style>
