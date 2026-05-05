<!--
  CatalogueCard.vue
  ─────────────────────────────────────────────────────────────────
  WCAG 2.1 AA compliance notes:
  • role="article" — correct landmark for a self-contained product unit
  • tabindex="0" + keyboard handlers — fully keyboard operable (WCAG 2.1.1)
  • :aria-label includes price — screen readers announce all key info at once
  • @keydown.space.prevent — space bar also activates (expected for role=button)
  • focus-visible ring — 3px solid #B5522A offset 3px (contrast ≥ 3:1 on dark bg)
  • img alt = descriptive title, not empty (WCAG 1.1.1)
  • aria-hidden="true" on decorative SVGs (WCAG 1.1.1)
  • highlight list uses <ul><li> semantics (WCAG 1.3.1)
  • colour never used as the ONLY means of conveying info (icon+text pairs)
  ─────────────────────────────────────────────────────────────────
  HCD / Nielsen heuristics notes:
  • Visibility of system status  — hover overlay + CTA arrow tell user what happens on click
  • Match between system & world — fabric/ruler/tag icons are universally understood
  • Consistency & standards      — card shape, padding, shadow levels match system-wide tokens
  • Recognition over recall      — key details (fabric, sizing, ordering) visible on the card
  • Aesthetic & minimalist       — 3 bullets max, no data bloat
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types'

type HighlightIcon = 'fabric' | 'ruler' | 'hanger' | 'tag' | 'layers'

const props = defineProps<{ product: Product }>()
const emit  = defineEmits<{ click: [product: Product] }>()

function formatPrice(price: number, symbol: string) {
  return `${symbol}\u00a0${price.toLocaleString('en-NG')}`
}

/* Three scannable bullets: material, measurements, garment type — from real fields + title. */
function getHighlights(p: Product) {
  const t = p.title.toLowerCase()
  const isLinen = t.includes('linen')
  const sizeCount = Object.keys(p.sizes ?? {}).filter(k => (p.sizes as Record<string, string>)[k]).length

  const materialMain = isLinen ? 'Premium linen' : 'Natural fabric'
  const materialSub = isLinen ? 'Breathable weave for warm days' : 'Lightweight, easy drape'

  const measureMain =
    sizeCount > 1 ? `${sizeCount} measurements in the guide` : 'Size measurements listed'
  const measureSub = 'Full chart on the detail page'

  let garmentIcon: HighlightIcon = 'tag'
  let garmentMain = 'Wardrobe piece'
  let garmentSub = 'Pairs with the rest of the collection'

  const coord =
    t.includes('shirt & trouser') ||
    t.includes('shirt and trouser') ||
    t.includes('shirt &amp; trouser')

  if (coord) {
    garmentIcon = 'hanger'
    garmentMain = 'Shirt and trouser set'
    garmentSub = 'Coordinated full look'
  } else if (t.includes('trouser') || t.includes('cargo') || t.includes('short')) {
    if (t.includes('cargo')) {
      garmentMain = 'Cargo trouser'
      garmentSub = 'Utility pockets, relaxed line'
    } else if (t.includes('short')) {
      garmentMain = 'Shorts'
      garmentSub = 'Warm-weather length'
    } else {
      garmentMain = 'Trouser'
      garmentSub = 'Tailored leg silhouette'
    }
  } else if (t.includes('t-shirt') || t.includes('tshirt') || t.includes('shirt')) {
    garmentIcon = 'layers'
    garmentMain = 'Shirt / top'
    garmentSub = 'Wear solo or layered'
  }

  return [
    { icon: 'fabric' as const, text: materialMain, detail: materialSub },
    { icon: 'ruler' as const, text: measureMain, detail: measureSub },
    { icon: garmentIcon, text: garmentMain, detail: garmentSub },
  ]
}

const cardAriaLabel = computed(() => {
  const price = formatPrice(props.product.price, props.product.currency_symbol)
  const parts = [`${props.product.title} — ${price}.`]
  if (props.product.featured) parts.push('Featured piece.')
  if (props.product.inStock === false) parts.push('Currently unavailable.')
  parts.push('Press Enter or Space to view details.')
  return parts.join(' ')
})
</script>

<template>
  <article
    class="product-card"
    tabindex="0"
    :aria-label="cardAriaLabel"
    @click="emit('click', product)"
    @keydown.enter.prevent="emit('click', product)"
    @keydown.space.prevent="emit('click', product)"
  >

    <!-- ── Image ────────────────────────────────────── -->
    <div class="card-image-wrap">
      <span v-if="product.featured" class="sr-only">Featured piece.</span>
      <div
        v-if="product.featured"
        class="featured-badge"
        aria-hidden="true"
      >
        <svg class="featured-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="14" height="14">
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.9l-3.52 1.85.67-3.93-2.85-2.78 3.94-.57L8 1.5z"/>
        </svg>
        <span>Featured</span>
      </div>
      <img
        :src="product.imgSrc"
        :alt="product.title"
        class="card-image"
        loading="lazy"
        width="400"
        height="533"
        decoding="async"
      />

      <!-- Gradient scrim + hover CTA -->
      <div class="card-scrim" aria-hidden="true">
        <div class="scrim-cta">
          <!-- Eye icon -->
          <svg class="scrim-eye" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <ellipse cx="11" cy="11" rx="9" ry="6"/>
            <circle cx="11" cy="11" r="2.8" fill="currentColor" stroke="none"/>
          </svg>
          <span class="scrim-label">View Details</span>
        </div>
      </div>

      <!-- Price pill — appears on hover, reinforces recognition -->
      <div class="price-pill" aria-hidden="true">
        {{ formatPrice(product.price, product.currency_symbol) }}
      </div>
    </div>

    <!-- ── Body ─────────────────────────────────────── -->
    <div class="card-body">

      <!-- Title + price row -->
      <div class="card-head">
        <p class="card-title">{{ product.title }}</p>
        <p class="card-price" aria-hidden="true">
          {{ formatPrice(product.price, product.currency_symbol) }}
        </p>
      </div>

      <p
        v-if="product.inStock === false"
        class="stock-note"
        role="status"
      >
        <svg class="stock-note__icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
          <circle cx="7" cy="7" r="6"/>
          <path d="M7 4v4M7 10h.01"/>
        </svg>
        Currently unavailable to order
      </p>

      <!-- Divider -->
      <div class="card-rule" aria-hidden="true" />

      <!-- Highlight bullets — icon + text pairs (never colour alone, WCAG 1.4.1) -->
      <ul class="highlights" aria-label="Product highlights">
        <li
          v-for="(h, i) in getHighlights(product)"
          :key="i"
          class="highlight"
        >
          <span class="h-icon-wrap" aria-hidden="true">
            <!-- Fabric icon -->
            <template v-if="h.icon === 'fabric'">
              <svg class="h-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true">
                <path d="M2 5 C4.5 3 7 7 9 5 C11 3 13.5 7 16 5"/>
                <path d="M2 9 C4.5 7 7 11 9 9 C11 7 13.5 11 16 9"/>
                <path d="M2 13 C4.5 11 7 15 9 13 C11 11 13.5 15 16 13"/>
              </svg>
            </template>
            <!-- Ruler icon -->
            <template v-else-if="h.icon === 'ruler'">
              <svg class="h-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true">
                <rect x="1.5" y="6.5" width="15" height="5" rx="1"/>
                <line x1="4"  y1="6.5" x2="4"  y2="9"/>
                <line x1="7"  y1="6.5" x2="7"  y2="8.5"/>
                <line x1="10" y1="6.5" x2="10" y2="9.5"/>
                <line x1="13" y1="6.5" x2="13" y2="8.5"/>
              </svg>
            </template>
            <!-- Hanger icon -->
            <template v-else-if="h.icon === 'hanger'">
              <svg class="h-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true">
                <path d="M9 4.5 A2 2 0 1 1 9 4.49"/>
                <path d="M9 6.5 L9 8 L2 14 Q1 15 2 15.5 L16 15.5 Q17 15 16 14 L9 8"/>
              </svg>
            </template>
            <!-- Layers (shirt/top) -->
            <template v-else-if="h.icon === 'layers'">
              <svg class="h-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true">
                <path d="M2.5 6.5 9 3.5l6.5 3-6.5 3-6.5-3z"/>
                <path d="M2.5 10 9 13l6.5-3"/>
                <path d="M2.5 12.5 9 15.5l6.5-3"/>
              </svg>
            </template>
            <!-- Tag icon -->
            <template v-else>
              <svg class="h-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true">
                <path d="M9.5 2H15a1 1 0 0 1 1 1v5.5L9 15.5 2.5 9l6.5-7z"/>
                <circle cx="13" cy="5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </template>
          </span>

          <div class="h-text">
            <span class="h-main">{{ h.text }}</span>
            <span class="h-sub">{{ h.detail }}</span>
          </div>
        </li>
      </ul>

      <!-- CTA footer — Nielsen: visibility of what clicking does -->
      <div class="card-footer" aria-hidden="true">
        <span class="footer-cta">View Piece</span>
        <svg class="footer-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4"/>
        </svg>
      </div>

    </div>
  </article>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ═══════════════════════════════════════════════
   CARD CONTAINER
   Shadow system uses layered shadows:
   - ambient (spread, low opacity) for depth
   - key (directional, medium opacity) for lift
   - rim (top edge glow) for luxury feel
   ═══════════════════════════════════════════════ */
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(22, 14, 11, 0.78);
  border: 1px solid rgba(201, 168, 76, 0.13);

  /* Layered shadow — calm resting state (depth without harsh edges) */
  box-shadow:
    0 2px 4px  rgba(0, 0, 0, 0.34),
    0 8px 24px rgba(0, 0, 0, 0.28),
    0 1px 0    rgba(201, 168, 76, 0.06) inset;

  transition:
    transform      0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow     0.38s cubic-bezier(0.22, 1, 0.36, 1),
    border-color   0.28s ease;

  /* Remove default outline; we provide our own focus ring below */
  outline: none;
}

/* Hover — lift + warm amber glow */
.product-card:hover {
  transform: translateY(-7px) scale(1.008);
  border-color: rgba(201, 168, 76, 0.32);
  box-shadow:
    0 2px 4px   rgba(0, 0, 0, 0.28),
    0 12px 32px rgba(0, 0, 0, 0.40),
    0 24px 48px rgba(28, 19, 16, 0.28),
    0 0 0 1px   rgba(201, 168, 76, 0.20),
    inset 0 1px 0 rgba(201, 168, 76, 0.14);
}

/* WCAG 2.4.7 — Focus visible with ≥3:1 contrast on dark bg */
.product-card:focus-visible {
  outline: 3px solid var(--terra);
  outline-offset: 3px;
  box-shadow:
    0 0 0 6px rgba(181, 82, 42, 0.22),
    0 12px 32px rgba(0, 0, 0, 0.40);
}

/* ── Image ─────────────────────────────────────── */
.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--terra-pale);
  flex-shrink: 0;
  box-shadow: inset 0 -1px 0 rgba(201, 168, 76, 0.08);
}

.featured-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(15, 9, 7, 0.92);
  background: linear-gradient(135deg, rgba(237, 216, 152, 0.95), rgba(201, 168, 76, 0.88));
  border: 1px solid rgba(250, 246, 239, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.featured-icon {
  flex-shrink: 0;
  color: rgba(15, 9, 7, 0.75);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.product-card:hover .card-image,
.product-card:focus-visible .card-image {
  transform: scale(1.07);
}

@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-card:hover,
  .product-card:focus-visible {
    transform: none;
  }
  .product-card:hover .card-image,
  .product-card:focus-visible .card-image {
    transform: none;
  }
  .product-card:hover .footer-arrow {
    transform: none;
  }
  .product-card:hover .scrim-cta {
    transform: translateY(0);
  }
}

/* ── Hover scrim overlay ────────────────────────── */
.card-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 9, 7, 0.88) 0%,
    rgba(15, 9, 7, 0.25) 45%,
    transparent 70%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 22px;
  opacity: 0;
  transition: opacity 0.32s ease;
}

.product-card:hover .card-scrim,
.product-card:focus-visible .card-scrim {
  opacity: 1;
}

.scrim-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  transform: translateY(10px);
  transition: transform 0.32s ease;
}

.product-card:hover .scrim-cta { transform: translateY(0); }

.scrim-eye {
  width: 34px;
  height: 34px;
  color: var(--ivory);
  background: rgba(250, 246, 239, 0.12);
  border: 1px solid rgba(250, 246, 239, 0.3);
  border-radius: 50%;
  padding: 7px;
  backdrop-filter: blur(6px);
}

.scrim-label {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.9);
  font-weight: 400;
}

/* ── Price pill ─────────────────────────────────── */
.price-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(15, 9, 7, 0.80);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 168, 76, 0.40);
  color: var(--gold);
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 0.04em;
  padding: 4px 11px;
  border-radius: 99px;
  opacity: 0;
  transform: translateY(-5px);
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.product-card:hover .price-pill {
  opacity: 1;
  transform: translateY(0);
}

/* ── Card body ──────────────────────────────────── */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 18px 18px 16px;
  flex: 1;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--ivory);
  line-height: 1.45;
  letter-spacing: 0.015em;
  flex: 1;
}

.card-price {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 300;
  color: var(--gold);
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

.stock-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -6px 0 12px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgba(237, 200, 160, 0.92);
}

.stock-note__icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  opacity: 0.9;
}

/* ── Rule ───────────────────────────────────────── */
.card-rule {
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(201, 168, 76, 0.22),
    rgba(201, 168, 76, 0.06),
    transparent
  );
  margin-bottom: 14px;
}

/* ── Highlights ─────────────────────────────────── */
.highlights {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.highlight {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* Icon tile — recognition + consistent alignment (Nielsen: match real world) */
.h-icon-wrap {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(181, 82, 42, 0.14);
  border: 1px solid rgba(201, 168, 76, 0.18);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.h-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: rgba(237, 200, 160, 0.95);
  transition: color 0.2s ease;
}

.product-card:hover .h-icon-wrap,
.product-card:focus-visible .h-icon-wrap {
  border-color: rgba(201, 168, 76, 0.32);
  background: rgba(181, 82, 42, 0.22);
}

.product-card:hover .h-icon,
.product-card:focus-visible .h-icon {
  color: var(--gold-light, #edd898);
}

.h-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.h-main {
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(250, 246, 239, 0.82);
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.h-sub {
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 300;
  color: rgba(196, 175, 150, 0.88);
  letter-spacing: 0.03em;
  line-height: 1.35;
}

/* ── Card footer CTA ────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(201, 168, 76, 0.09);
  padding-top: 12px;
  margin-top: auto;
}

.footer-cta {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: rgba(181, 82, 42, 0.7);
  font-weight: 400;
  transition: color 0.22s ease;
}

.footer-arrow {
  width: 15px;
  height: 15px;
  color: rgba(181, 82, 42, 0.55);
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), color 0.22s ease;
}

.product-card:hover .footer-cta { color: var(--terra-light); }
.product-card:hover .footer-arrow {
  transform: translateX(5px);
  color: var(--terra-light);
}
</style>
