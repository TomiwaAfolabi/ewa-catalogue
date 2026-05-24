<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import type { Product } from '@/types'
import EwaPageSpinner from '@/components/ui/EwaPageSpinner.vue'

const router = useRouter()
const productStore = useProductStore()
const scrollStripEl = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const brandSectionRef = ref<HTMLElement | null>(null)

let brandResizeObserver: ResizeObserver | null = null

/** Hero min-height = ½ of section 3 (brand) height — updates when brand layout changes. */
function syncHeroMinHeightToBrand() {
  const brand = brandSectionRef.value
  const hero = heroRef.value
  if (!brand || !hero) return
  const h = brand.offsetHeight
  if (h < 40) return
  hero.style.minHeight = `${Math.round(h * 0.5)}px`
}

function formatPrice(price: number, symbol: string) {
  return `${symbol}\u00a0${price.toLocaleString('en-NG')}`
}

const spotlightProducts = computed((): Product[] => productStore.spotlightProducts)

/** Layout for the featured strip — avoids empty space when fewer than 4 pieces. */
const spotlightLayout = computed(() => {
  const count = spotlightProducts.value.length
  const cols = Math.min(Math.max(count, 1), 4)
  return {
    count,
    cols,
    needsScroll: count > 4,
  }
})

function openProduct(p: Product) {
  router.push({
    name: 'catalogue-detail',
    params: { id: (p.catalogueKey ?? p.id).toString() },
  })
}

function scrollStrip(direction: -1 | 1) {
  const el = scrollStripEl.value
  if (!el) return
  const delta = el.clientWidth * 0.45 * direction
  const smooth =
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'instant' })
}

onMounted(async () => {
  if (!productStore.spotlightProducts.length) {
    try {
      await productStore.fetchSpotlightProducts()
    } catch {
      /* store handles error state */
    }
  }

  await nextTick()
  syncHeroMinHeightToBrand()

  const brand = brandSectionRef.value
  if (brand && typeof ResizeObserver !== 'undefined') {
    brandResizeObserver = new ResizeObserver(() => syncHeroMinHeightToBrand())
    brandResizeObserver.observe(brand)
  }
})

onBeforeUnmount(() => {
  brandResizeObserver?.disconnect()
  brandResizeObserver = null
})
</script>

<template>
  <!-- ── NAV already in layout, this is page content ── -->

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section ref="heroRef" class="hero home-reveal" aria-label="Introduction">
    <div class="hero-left">
      <div class="rebrand-badge">✦ A New Chapter Begins</div>
      <h1 class="hero-headline ">
        Where <em>Heritage</em><br class="hidden sm:block"/> Meets <br class="hidden sm:block" /> the Modern Man
      </h1>
      <p class="hero-sub">African beauty, reimagined</p>
      <p class="hero-body">
        <strong>Ewa</strong> is not just clothing, it is a celebration
        of the craftsmen who came before us, and the men we are becoming.
        Every thread carries a story.
      </p>
      <div class="hero-ctas">
        <button class="btn-primary" @click="router.push({ name: 'catalogue' })">
          Discover Ewa
        </button>
        <button class="btn-ghost" @click="router.push({ name: 'catalogue' })">
          Shop the Collection ↓
        </button>
      </div>
    </div>

    <div class="hero-right">
      <div class="hero-fabric-bg" />
      <div class="hero-center-art">
        <div class="hero-emblem-float" aria-hidden="true">
        <svg class="lily-emblem" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(60 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(120 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(180 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(240 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(300 140 140)"/>
          <circle cx="140" cy="140" r="24" fill="#B5522A"/>
          <circle cx="140" cy="140" r="14" fill="#C9A84C"/>
          <circle cx="140" cy="140" r="110" stroke="#C9A84C" stroke-width="1" stroke-dasharray="4 6" fill="none"/>
        </svg>
        </div>
      </div>
      <div class="hero-quote">
        <p class="hero-quote-text">"He carries culture in his walk<br />and confidence in his cloth."</p>
        <span class="hero-quote-attr">✦ The Ewa Man</span>
      </div>
    </div>
  </section>

  <!-- ── CTA + featured slideshow (section 2 — full-width band) ────────────── -->
  <section
    class="section-cta home-reveal home-reveal--delay-1"
    aria-labelledby="cta-heading"
  >
    <div class="cta-layout">
      <div class="cta-copy">
        <p class="cta-eyebrow">The collection</p>
        <h2 id="cta-heading" class="cta-headline">
          Ready to wear your <em>heritage</em>?
        </h2>
        <p class="cta-lead">
          Shop pieces made for everyday confidence. Breathable fabrics, careful tailoring, and silhouettes rooted in African elegance.
        </p>
       
        <div class="cta-actions">
          <button type="button" class="btn-primary" @click="router.push({ name: 'catalogue' })">
            Shop the catalogue
          </button>
          <button type="button" class="btn-ghost btn-ghost--light" @click="router.push({ name: 'catalogue' })">
            View all pieces
          </button>
        </div>
      </div>
    </div>

    <!-- Cream strip — full viewport width (edge to edge) -->
    <div class="cta-slider-bleed">
      <div class="cta-slider-wrap">
        <template v-if="spotlightProducts.length">
          <div class="cta-slider-inner">
            <div class="cta-strip-toolbar">
             
              <div v-if="spotlightLayout.needsScroll" class="cta-scroll-btns">
                <button
                  type="button"
                  class="cta-icon-btn"
                  aria-label="Scroll collection left"
                  @click="scrollStrip(-1)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M11 4L6 9l5 5"/>
                  </svg>
                </button>
                <button
                  type="button"
                  class="cta-icon-btn"
                  aria-label="Scroll collection right"
                  @click="scrollStrip(1)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M7 4l5 5-5 5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="cta-slider">
            <div
              ref="scrollStripEl"
              class="cta-scroll"
              :class="{
                'cta-scroll--fitted': !spotlightLayout.needsScroll,
                [`cta-scroll--count-${spotlightLayout.count}`]: !spotlightLayout.needsScroll,
              }"
              :style="{ '--cta-cols': spotlightLayout.cols }"
              role="region"
              aria-label="Collection highlights"
              aria-describedby="cta-scroll-desc"
            >
              <article
                v-for="p in spotlightProducts"
                :key="p.id"
                class="cta-scroll-card"
              >
                <button
                  type="button"
                  class="cta-scroll-card__visual"
                  @click="openProduct(p)"
                >
                  <img
                    :src="p.imgSrc"
                    :alt="p.title"
                    width="280"
                    height="374"
                    loading="lazy"
                    decoding="async"
                    class="cta-scroll-card__img"
                  />
                  <span class="cta-scroll-card__shine" aria-hidden="true" />
                </button>
                <div class="cta-scroll-card__meta">
                  <p class="cta-scroll-card__title">{{ p.title }}</p>
                  <p class="cta-scroll-card__price">
                    {{ formatPrice(p.price, p.currency_symbol) }}
                  </p>
                  <button type="button" class="cta-scroll-card__link" @click="openProduct(p)">
                    View piece
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            </div>
          </div>
        </template>

        <div
          v-else-if="productStore.spotlightLoading"
          class="cta-slider cta-slider--placeholder"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
      
          <div class="cta-slider-inner cta-slider-inner--flush">
            <div class="cta-scroll cta-scroll--skeleton">
              <div v-for="i in 8" :key="i" class="cta-scroll-sk" aria-hidden="true">
                <div class="cta-scroll-sk__img" />
                <div class="cta-scroll-sk__line" />
                <div class="cta-scroll-sk__line cta-scroll-sk__line--short" />
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="cta-slider cta-slider--empty"
          role="status"
        >
          <div class="cta-slider-inner">
            <p class="cta-empty-text">Pieces will appear here once the catalogue loads.</p>
            <button type="button" class="btn-primary" @click="router.push({ name: 'catalogue' })">
              Open the shop
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Brand mark + story (section 3) ───────────────────────────────────── -->
  <section
    ref="brandSectionRef"
    class="section-brand home-reveal home-reveal--delay-2"
    aria-labelledby="brand-heading"
  >
    <div class="brand-split">
      <div class="brand-logo-col">
        <img
          src="/brand/ewa-logo.png"
          class="brand-logo"
          alt="ẹwà man — Ewa wordmark with a line-drawn profile, Yoruba for beauty"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="brand-copy">
        <p class="section-label">The mark</p>
        <h2 id="brand-heading" class="brand-title">
          Beauty you can <em>wear</em>
        </h2>
        <p class="brand-lead">
          <strong>ẹwà</strong> (Ewa) is Yoruba for beauty — not only what you see, but what you feel in fabric against skin and in how you move through the world.
        </p>
        <p class="brand-body">
          Our mark pairs that idea with the Ewa man: deliberate, rooted, and modern. Every piece in the collection is cut and finished to honour the same standar. Clothing you can live in, tailoring you can trust, and style that radiates confidence.
        </p>
        <p class="brand-body">
          When you shop with us, you are choosing clothes that carry culture forward: wearable, intentional, and unapologetically refined.
        </p>
      </div>
    </div>
  </section>

  <!-- ── PILLARS ───────────────────────────────────────────────────────────── -->
  <section class="section-pillars home-reveal home-reveal--delay-3" aria-labelledby="pillars-heading">
    <div class="pillars-header">
      <div class="section-label" style="text-align:center;">Our Promise</div>
      <h2 id="pillars-heading">What we stand for</h2>
    </div>
    <div class="pillars-grid">
      <div class="pillar">
        <svg class="pillar-icon" viewBox="0 0 40 40" fill="none">
          <path d="M20 4 C20 4 28 12 28 20 C28 28 20 36 20 36 C20 36 12 28 12 20 C12 12 20 4 20 4Z" stroke="#C9A84C" stroke-width="1" fill="rgba(201,168,76,0.1)"/>
          <circle cx="20" cy="20" r="4" fill="#C9A84C"/>
        </svg>
        <h3 class="pillar-title">Redefine African Fashion</h3>
        <p class="pillar-text">Bringing African inspired design into the contemporary market not as costume, but as culture in motion.</p>
      </div>
      <div class="pillar">
        <svg class="pillar-icon" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="8" width="24" height="24" stroke="#B5522A" stroke-width="1" fill="rgba(181,82,42,0.1)"/>
          <line x1="8" y1="20" x2="32" y2="20" stroke="#B5522A" stroke-width="0.5"/>
          <line x1="20" y1="8" x2="20" y2="32" stroke="#B5522A" stroke-width="0.5"/>
        </svg>
        <h3 class="pillar-title">Make Culture Wearable</h3>
        <p class="pillar-text">Culturally inspired clothing that is accessible, comfortable, and deeply empowering for every man.</p>
      </div>
      <div class="pillar">
        <svg class="pillar-icon" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="#5C6040" stroke-width="1" fill="rgba(92,96,64,0.1)"/>
          <circle cx="20" cy="20" r="6" fill="#5C6040" opacity="0.5"/>
          <path d="M20 6 L20 34 M6 20 L34 20" stroke="#5C6040" stroke-width="0.5"/>
        </svg>
        <h3 class="pillar-title">Build a Community</h3>
        <p class="pillar-text">A gathering of people who celebrate individuality, honour their roots, and lift each other.</p>
      </div>
    </div>
  </section>
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

/* Gentle section entrances (honours reduced motion below) */
.home-reveal {
  opacity: 0;
  animation: homeRise 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.home-reveal--delay-1 { animation-delay: 0.06s; }
.home-reveal--delay-2 { animation-delay: 0.12s; }
.home-reveal--delay-3 { animation-delay: 0.18s; }

@keyframes homeRise {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-reveal {
    opacity: 1;
    animation: none;
    transform: none;
  }
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height:530px;
 
}

.hero-left {
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: rgba(28, 19, 16, 0.72);
}

.hero-left::after {
  content: '';
  position: absolute;
  right: 0; top: 10%; bottom: 10%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--terra-light), transparent);
}

.rebrand-badge {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold);
  border: 1px solid rgba(201, 168, 76, 0.35);
  padding: 6px 16px;
  margin-bottom: 36px;
  width: fit-content;
  font-weight: 400;
}

.hero-headline {
  font-family: var(--font-serif);
  font-size: clamp(20px, 3.2vw, 80px);
  font-weight: 300;
  line-height: 1.0;
  color: var(--ivory);
  
 
}
.hero-headline em { font-style: italic; color: var(--terra); }

.hero-sub {
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 300;
  margin-bottom: 28px;
}

.hero-body {
  font-size: 16px;
  line-height: 1.75;
  color: rgba(250, 246, 239, 0.88);
  max-width: 440px;
  margin-bottom: 48px;
  font-weight: 400;
}
.hero-body strong { color: var(--terra); font-weight: 400; }

.hero-ctas {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.hero-right {
  position: relative;
  background: var(--terra-pale);
  overflow: hidden;
}

.hero-fabric-bg {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(201,168,76,0.06) 30px, rgba(201,168,76,0.06) 31px),
    repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(181,82,42,0.04) 30px, rgba(181,82,42,0.04) 31px);
}

.hero-center-art {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-emblem-float {
  animation: emblemFloat 14s ease-in-out infinite;
}

.lily-emblem {
  width: 300px;
  height: 300px;
  opacity: 0.2;
  animation: slowSpin 72s linear infinite;
}

@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes emblemFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-emblem-float {
    animation: none;
  }
  .lily-emblem {
    animation: none;
  }
}

.hero-quote {
  position: absolute;
  bottom: 60px;
  left: 48px;
  right: 48px;
}

.hero-quote-text {
  font-family: var(--font-serif);
  font-size: 22px;
  font-style: italic;
  font-weight: 300;
  color: var(--ink-soft);
  line-height: 1.5;
  margin-bottom: 12px;
}

.hero-quote-attr {
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold);
}

/* ── Brand logo + write-up (section 3 — same dark band as Our Story) ─────── */
.section-brand {
  width: 100%;
  padding: 72px 64px 76px;
  background: rgba(28, 19, 16, 0.75);
  border-top: 1px solid rgba(201, 168, 76, 0.1);
}

.brand-split {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(280px, 1fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: center;
}

.brand-logo-col {
  display: flex;
 justify-content: center;

}

.brand-logo {
  width: 80%;
  height: 50%;
  display: block;
  border-radius: 10px;
}

.brand-copy {
  text-align: left;
}

.brand-copy .section-label {
  margin-bottom: 16px;
}

.brand-title {
  font-family: var(--font-serif);
  font-size: clamp(28px, 3.4vw, 44px);
  font-weight: 300;
  color: var(--ivory);
  line-height: 1.12;
  margin-bottom: 16px;
}

.brand-title em {
  font-style: italic;
  color: var(--terra);
}

.brand-lead {
  font-size: 16px;
  line-height: 1.75;
  color: rgba(250, 246, 239, 0.82);
  margin-bottom: 12px;
  font-weight: 400;
}

.brand-lead strong {
  color: var(--terra-light);
  font-weight: 500;
}

.brand-body {
  font-size: 15px;
  line-height: 1.75;
  color: rgba(250, 246, 239, 0.78);
  margin-bottom: 14px;
  font-weight: 400;
}

.brand-body:last-child {
  margin-bottom: 0;
}

/* ── Pillars ───────────────────────────────────────────────────────────────── */
.section-pillars {
  padding: 100px 64px;
  background: rgba(28, 19, 16, 0.6);
}

.pillars-header {
  text-align: center;
  margin-bottom: 64px;
}

.pillars-header h2 {
  font-family: var(--font-serif);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 300;
  color: var(--ivory);
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.pillar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 32px;
  border: 1px solid rgba(201, 168, 76, 0.15);
  border-radius: var(--radius-sm);
  background: rgba(250, 246, 239, 0.03);
  transition: border-color var(--transition-base), background var(--transition-base);
}
.pillar:hover {
  border-color: rgba(201, 168, 76, 0.35);
  background: rgba(250, 246, 239, 0.06);
}

.pillar-icon { width: 40px; height: 40px; }

.pillar-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 300;
  color: var(--ivory);
}

.pillar-text {
  font-size: 15px;
  line-height: 1.75;
  color: rgba(250, 246, 239, 0.78);
  font-weight: 400;
}

/* ── CTA + horizontal collection strip (section 2, compact) ─────────────── */
.section-cta {
  padding: 40px 0 44px;
  width: 100%;
  background: #ffffff;
  color: var(--ink);
  border-top: 1px solid rgba(28, 19, 16, 0.06);
}

.cta-layout {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 16px;
  padding: 0 clamp(20px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

/* Full-bleed cream band behind the scroller (edge to edge) */
.cta-slider-bleed {
  width: 100%;
  margin: 0;
  padding: 14px 0 16px;
  background: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.cta-slider-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

.cta-slider-inner--flush {
  padding-left: clamp(16px, 5vw, 56px);
  padding-right: clamp(16px, 5vw, 56px);
}

.cta-copy {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.cta-eyebrow {
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--terra);
  font-weight: 600;
  margin-bottom: 10px;
}

.cta-headline {
  font-family: var(--font-serif);
  font-size: clamp(28px, 3.5vw, 44px);
  font-weight: 400;
  color: var(--ink);
  line-height: 1.12;
  margin-bottom: 8px;
}

.cta-headline em {
  font-style: italic;
  color: var(--terra);
}

.cta-lead {
  font-size: 15px;
  line-height: 1.55;
  color: var(--ink-soft);
  font-weight: 400;
  margin-bottom: 6px;
}

.cta-body {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(74, 55, 40, 0.88);
  font-weight: 400;
  margin-bottom: 14px;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px 28px;
}

.btn-ghost--light {
  color: var(--ink-soft);
  border-bottom: 1px solid rgba(181, 82, 42, 0.35);
  padding: 8px 0;
}
.btn-ghost--light:hover {
  color: var(--terra);
  border-bottom-color: var(--terra);
}

/* ── Horizontal scroll: 4 cards visible, 8 items total ───────────────────── */
.cta-slider-wrap {
  width: 100%;
  min-height: 0;
}

.cta-strip-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 16px;
  margin-bottom: 6px;
}

.cta-scroll-hint {
  flex: 1;
  min-width: 200px;
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(74, 55, 40, 0.75);
}

.cta-scroll-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.cta-slider {
  position: relative;
  width: 100%;
  padding: 6px 0 2px;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
}

.cta-scroll {
  --cta-gap: 12px;
  --cta-cols: 4;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--cta-cols) - 1) * var(--cta-gap)) / var(--cta-cols));
  gap: var(--cta-gap);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: clamp(16px, 5vw, 56px);
  padding: 12px;
  -webkit-overflow-scrolling: touch;
}

/* Fewer than 5 pieces: fill the row evenly (no empty fourth column). */
.cta-scroll--fitted {
  grid-auto-flow: unset;
  grid-auto-columns: unset;
  grid-template-columns: repeat(var(--cta-cols), minmax(0, 1fr));
  overflow-x: visible;
  scroll-snap-type: none;
  justify-content: center;
}

.cta-scroll--fitted.cta-scroll--count-1 {
  grid-template-columns: minmax(0, min(320px, 100%));
}

.cta-scroll--fitted .cta-scroll-card {
  max-width: 360px;
  width: 100%;
  margin-inline: auto;
}

.cta-scroll:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 4px;
}

.cta-scroll-card {
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cta-scroll-card__visual {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 3 / 4;
  box-shadow: 0 4px 18px rgba(28, 19, 16, 0.1);
}

.cta-scroll-card__visual:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

.cta-scroll-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.cta-scroll-card__visual:hover .cta-scroll-card__img {
  transform: scale(1.03);
}

.cta-scroll-card__shine {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: linear-gradient(
    125deg,
    transparent 42%,
    rgba(255, 255, 255, 0.18) 50%,
    transparent 58%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
}

.cta-scroll-card__visual:hover .cta-scroll-card__shine {
  opacity: 1;
}

.cta-scroll-card__meta {
  text-align: center;
  padding: 0 2px;
}

.cta-scroll-card__title {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.3;
  margin: 0 0 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cta-scroll-card__price {
  font-family: var(--font-serif);
  font-size: 15px;
  color: var(--terra);
  margin: 0 0 4px;
}

.cta-scroll-card__link {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--terra);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--font-sans);
  border-bottom: 1px solid rgba(181, 82, 42, 0.3);
  padding-bottom: 1px;
}

.cta-scroll-card__link:hover {
  color: var(--plum);
  border-bottom-color: var(--plum);
}

.cta-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(28, 19, 16, 0.12);
  background: #fff;
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.cta-icon-btn:hover {
  border-color: var(--terra);
  color: var(--terra);
  background: rgba(181, 82, 42, 0.06);
}

.cta-slider--placeholder {
  padding: 12px 0 18px;
}

.home-loader-strip {
  display: flex;
  justify-content: center;
  padding: 20px 16px 4px;
}

.cta-scroll--skeleton {
  grid-auto-columns: calc((100% - 3 * var(--cta-gap)) / 4);
}

.cta-scroll-sk {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cta-scroll-sk__img {
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-sm);
  background: #e8e2db;
  animation: phPulse 1.3s ease-in-out infinite;
}

.cta-scroll-sk__line {
  height: 10px;
  border-radius: 4px;
  background: #e4ddd6;
  animation: phPulse 1.3s ease-in-out infinite;
}

.cta-scroll-sk__line--short {
  width: 55%;
  margin: 0 auto;
}

@keyframes phPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.cta-slider--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 28px 20px 32px;
}

.cta-slider--empty .cta-slider-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cta-empty-text {
  font-size: 14px;
  color: var(--ink-soft);
  max-width: 280px;
  line-height: 1.55;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cta-scroll-card__visual:hover .cta-scroll-card__img {
    transform: none;
  }
  .cta-scroll-sk__img,
  .cta-scroll-sk__line {
    animation: none;
    opacity: 1;
  }
}

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .pillars-grid { grid-template-columns: 1fr; }
  .cta-scroll:not(.cta-scroll--fitted) {
    --cta-cols: 2;
  }
  .cta-scroll--skeleton {
    --cta-cols: 2;
    grid-auto-columns: calc((100% - var(--cta-gap)) / 2);
  }
}

@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; }
  .hero-left { padding: 60px 24px; }
  .hero-left::after { display: none; }
  .hero-right { min-height: 300px; }
  .section-pillars { padding: 60px 24px; }
  .section-cta { padding: 32px 0 36px; }
  .cta-layout {
    padding: 0 20px;
    margin-bottom: 14px;
  }
  .section-brand { padding: 48px 24px 52px; }
  .brand-split {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .brand-copy {
    text-align: center;
  }
  .brand-copy .section-label {
    text-align: center;
  }
  .cta-strip-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .cta-scroll-btns {
    justify-content: center;
  }
}

@media (max-width: 520px) {
  .cta-scroll:not(.cta-scroll--fitted) {
    grid-auto-columns: minmax(140px, 82%);
  }
  .cta-scroll--skeleton {
    grid-auto-columns: minmax(140px, 82%);
  }
  .cta-scroll--fitted.cta-scroll--count-2,
  .cta-scroll--fitted.cta-scroll--count-3 {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
