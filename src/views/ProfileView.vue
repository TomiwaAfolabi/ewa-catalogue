<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import api from '@/services/api'
import type { Product, UserOrder } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const productStore = useProductStore()
const { user } = storeToRefs(auth)

const orders = ref<UserOrder[]>([])
const ordersLoading = ref(true)
const ordersError = ref<string | null>(null)
const ordersTotal = ref(0)

const orderSearch = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const recScrollEl = ref<HTMLElement | null>(null)

const ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

function statusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status.replace(/_/g, ' ').toLowerCase()
}

function statusTone(status: string): 'ok' | 'wait' | 'ship' | 'bad' {
  if (status === 'DELIVERED' || status === 'PAID') return 'ok'
  if (status === 'SHIPPED' || status === 'PROCESSING') return 'ship'
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'bad'
  return 'wait'
}

function formatKobo(amount: number, currency: string): string {
  const sym = currency === 'NGN' ? '₦' : currency
  const naira = Math.round(amount) / 100
  return `${sym}\u00a0${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

/** Local calendar date YYYY-MM-DD for range filter */
function orderDateKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function shortOrderId(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

function orderMatchesSearch(o: UserOrder, q: string): boolean {
  const t = q.trim().toLowerCase()
  if (!t) return true
  const blob = [
    o.id,
    shortOrderId(o.id),
    statusLabel(o.status),
    o.status,
    formatDate(o.createdAt),
    ...(o.items ?? []).map(i => `${i.title} ${i.selectedSize ?? ''}`),
  ]
    .join(' ')
    .toLowerCase()
  return blob.includes(t)
}

function orderInDateRange(o: UserOrder): boolean {
  const key = orderDateKey(o.createdAt)
  let from = dateFrom.value
  let to = dateTo.value
  if (from && to && from > to) {
    const swap = from
    from = to
    to = swap
  }
  if (from && key < from) return false
  if (to && key > to) return false
  return true
}

const filteredOrders = computed(() =>
  orders.value.filter(o => orderMatchesSearch(o, orderSearch.value) && orderInDateRange(o)),
)

const filtersActive = computed(
  () => Boolean(orderSearch.value.trim() || dateFrom.value || dateTo.value),
)

function clearOrderFilters() {
  orderSearch.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

/** Same mix as the homepage spotlight strip: featured first, then others. */
const spotlightProducts = computed((): Product[] => {
  const list = productStore.products
  if (!list.length) return []
  const featured = list.filter(p => p.featured)
  const rest = list.filter(p => !p.featured)
  return [...featured, ...rest].slice(0, 8)
})

function formatPrice(price: number, symbol: string) {
  return `${symbol}\u00a0${price.toLocaleString('en-NG')}`
}

function openProduct(p: Product) {
  router.push({
    name: 'catalogue-detail',
    params: { id: (p.catalogueKey ?? p.id).toString() },
  })
}

function scrollRecStrip(direction: -1 | 1) {
  const el = recScrollEl.value
  if (!el) return
  const delta = el.clientWidth * 0.45 * direction
  const smooth =
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'instant' })
}

const displayName = computed(() => {
  const u = user.value
  if (!u) return ''
  const n = [u.firstName, u.lastName].filter(Boolean).join(' ')
  return n || u.email
})

onMounted(async () => {
  if (!productStore.products.length) {
    try {
      await productStore.fetchProducts()
    } catch {
      /* non-fatal for profile */
    }
  }

  ordersLoading.value = true
  ordersError.value = null
  try {
    const res = await api.orders.list({ page: 1, perPage: 50 })
    orders.value = res.data.data
    ordersTotal.value = res.data.total
  } catch (e) {
    ordersError.value = e instanceof Error ? e.message : 'Could not load orders.'
  } finally {
    ordersLoading.value = false
  }
})
</script>

<template>
  <div class="profile">
    <div class="profile-inner">
      <header class="profile-head">
        <p class="eyebrow">My account</p>
        <h1 class="title">{{ displayName }}</h1>
        <p v-if="user?.email" class="sub">{{ user.email }}</p>
      </header>

      <section class="panel" aria-labelledby="orders-heading">
        <div class="panel-head">
          <h2 id="orders-heading" class="panel-title">Your orders</h2>
          <p v-if="!ordersLoading && ordersTotal" class="panel-meta">
            <template v-if="filtersActive">
              {{ filteredOrders.length }} match{{ filteredOrders.length === 1 ? '' : 'es' }} · {{ ordersTotal }} total
            </template>
            <template v-else>
              {{ ordersTotal }} total
            </template>
          </p>
        </div>

        <div v-if="!ordersLoading && !ordersError && orders.length" class="orders-toolbar">
          <label class="orders-search">
            <span class="sr-only">Search orders</span>
            <input
              v-model="orderSearch"
              type="search"
              class="orders-input"
              placeholder="Search by order ID, status, or item…"
              autocomplete="off"
            >
          </label>
          <div class="orders-date-row">
            <label class="orders-date">
              <span>From</span>
              <input v-model="dateFrom" class="orders-input orders-input--date" type="date">
            </label>
            <label class="orders-date">
              <span>To</span>
              <input v-model="dateTo" class="orders-input orders-input--date" type="date">
            </label>
            <button
              v-if="filtersActive"
              type="button"
              class="orders-clear"
              @click="clearOrderFilters"
            >
              Clear filters
            </button>
          </div>
        </div>

        <p v-if="ordersLoading" class="state">Loading orders…</p>
        <p v-else-if="ordersError" class="state state--error" role="alert">{{ ordersError }}</p>
        <p v-else-if="!orders.length" class="state">
          You have not placed an order yet.
          <button type="button" class="linkish" @click="router.push({ name: 'catalogue' })">
            Browse the shop
          </button>
        </p>

        <template v-else>
          <p v-if="!filteredOrders.length" class="state state--dim">
            No orders match your search or date range.
            <button type="button" class="linkish" @click="clearOrderFilters">Reset filters</button>
          </p>
          <div v-else class="order-scroll" role="region" aria-label="Order list">
            <ul class="order-list" role="list">
              <li v-for="order in filteredOrders" :key="order.id" class="order-card">
                <div class="order-top">
                  <div class="order-ids">
                    <span class="order-num">Order {{ shortOrderId(order.id) }}</span>
                    <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <span
                    class="status-pill"
                    :class="[`status-pill--${statusTone(order.status)}`]"
                  >
                    {{ statusLabel(order.status) }}
                  </span>
                </div>
                <p class="order-total">{{ formatKobo(order.total, order.currency) }}</p>
                <ul v-if="order.items?.length" class="order-lines">
                  <li v-for="it in order.items" :key="it.id" class="order-line">
                    <span class="order-line-title">{{ it.title }}</span>
                    <span class="order-line-qty">× {{ it.quantity }}</span>
                    <span v-if="it.selectedSize" class="order-line-size">Size {{ it.selectedSize }}</span>
                  </li>
                </ul>
                <p v-if="order.payments?.length" class="pay-hint">
                  Payment: {{ order.payments[order.payments.length - 1]?.status?.replace(/_/g, ' ') ?? '—' }}
                </p>
              </li>
            </ul>
          </div>
        </template>
      </section>
    </div>

    <!-- Full-bleed recommendations: horizontal strip (homepage-style) -->
    <section class="rec-bleed" aria-labelledby="rec-heading">
      <div class="rec-bleed-inner">
        <div class="rec-bleed-head">
          <div>
            <h2 id="rec-heading" class="rec-bleed-title">You might also like</h2>
            <p class="rec-bleed-lead">Featured pieces and more — swipe or use the arrows.</p>
          </div>
          <div class="rec-bleed-btns">
            <button
              type="button"
              class="rec-icon-btn"
              aria-label="Scroll recommendations left"
              @click="scrollRecStrip(-1)"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M11 4L6 9l5 5"/>
              </svg>
            </button>
            <button
              type="button"
              class="rec-icon-btn"
              aria-label="Scroll recommendations right"
              @click="scrollRecStrip(1)"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M7 4l5 5-5 5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="productStore.loading && !spotlightProducts.length" class="rec-h-skel-wrap" aria-busy="true">
        <div class="rec-h-skel">
          <div v-for="i in 6" :key="i" class="rec-h-skel-card" />
        </div>
      </div>

      <div
        v-else-if="spotlightProducts.length"
        ref="recScrollEl"
        class="rec-h-scroll"
        role="region"
        aria-label="Recommended products"
      >
        <article
          v-for="p in spotlightProducts"
          :key="p.id"
          class="rec-h-card"
        >
          <button type="button" class="rec-h-card__visual" @click="openProduct(p)">
            <img
              class="rec-h-card__img"
              :src="p.imgSrc || p.images?.[0] || ''"
              :alt="p.title"
              loading="lazy"
              decoding="async"
            >
            <span class="rec-h-card__shine" aria-hidden="true" />
          </button>
          <div class="rec-h-card__meta">
            <p class="rec-h-card__title">{{ p.title }}</p>
            <p class="rec-h-card__price">{{ formatPrice(p.price, p.currency_symbol) }}</p>
            <button type="button" class="rec-h-card__link" @click="openProduct(p)">
              View piece
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      </div>

      <p v-else class="rec-bleed-empty">Catalogue will load here when available.</p>
    </section>
  </div>
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

.profile {
  min-height: calc(100vh - 72px);
  padding: 32px 0 0;
  background: linear-gradient(180deg, rgba(28, 19, 16, 0.92) 0%, rgba(20, 12, 9, 0.97) 100%);
  color: #faf6ef;
}

.profile-inner {
  max-width: 880px;
  margin: 0 auto;
  padding: 0 20px 32px;
}

.profile-head {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold, #c9a84c);
}

.title {
  margin: 0 0 6px;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
}

.sub {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
  word-break: break-all;
}

.panel {
  background: rgba(250, 246, 239, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: 12px;
  padding: 22px 20px 24px;
  margin-bottom: 0;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold, #c9a84c);
}

.panel-meta {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.75;
}

.orders-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.orders-search {
  width: 100%;
}

.orders-date-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 16px;
}

.orders-date {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.65);
}

.orders-input {
  width: 100%;
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(12, 8, 6, 0.45);
  color: #faf6ef;
  font-size: 0.9rem;
}

.orders-input--date {
  max-width: 168px;
  color-scheme: dark;
}

.orders-input:focus {
  outline: 2px solid var(--gold, #c9a84c);
  outline-offset: 1px;
}

.orders-clear {
  align-self: center;
  margin-left: auto;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(201, 168, 76, 0.35);
  background: transparent;
  color: var(--gold, #c9a84c);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.orders-clear:hover {
  background: rgba(201, 168, 76, 0.12);
}

.state {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.88;
  line-height: 1.5;
}

.state--error {
  color: #ffb4a8;
}

.state--dim {
  opacity: 0.78;
}

.linkish {
  display: inline;
  margin-left: 6px;
  padding: 0;
  border: none;
  background: none;
  color: var(--gold, #c9a84c);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.order-scroll {
  max-height: min(420px, 52vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  margin: 0 -4px 0 0;
  padding-right: 6px;
  -webkit-overflow-scrolling: touch;
}

.order-scroll:focus-visible {
  outline: 2px solid var(--gold, #c9a84c);
  outline-offset: 2px;
}

.order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-card {
  padding: 16px 14px;
  border-radius: 10px;
  background: rgba(12, 8, 6, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.order-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.order-ids {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-num {
  font-weight: 600;
  font-size: 0.95rem;
}

.order-date {
  font-size: 0.78rem;
  opacity: 0.75;
}

.status-pill {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 99px;
  font-weight: 600;
}

.status-pill--ok {
  background: rgba(34, 160, 110, 0.25);
  color: #9ee4c5;
}

.status-pill--ship {
  background: rgba(201, 168, 76, 0.22);
  color: #f0e6c8;
}

.status-pill--wait {
  background: rgba(255, 255, 255, 0.1);
  color: #e8dfd4;
}

.status-pill--bad {
  background: rgba(200, 80, 60, 0.25);
  color: #ffc9bf;
}

.order-total {
  margin: 10px 0 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.order-lines {
  list-style: none;
  margin: 12px 0 0;
  padding: 10px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.82rem;
  opacity: 0.9;
}

.order-line-title {
  flex: 1;
  min-width: 0;
}

.order-line-qty {
  opacity: 0.75;
}

.order-line-size {
  width: 100%;
  font-size: 0.75rem;
  opacity: 0.65;
}

.pay-hint {
  margin: 10px 0 0;
  font-size: 0.72rem;
  opacity: 0.65;
  text-transform: capitalize;
}

/* ── Full-width cream band + horizontal strip (homepage-style) ─────────── */
.rec-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  margin-top: 40px;
  padding: 28px 0 56px;
  background: #faf6ef;
  color: #2c1810;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.rec-bleed-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 56px);
}

.rec-bleed-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.rec-bleed-title {
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  color: #2c1810;
}

.rec-bleed-lead {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #5c4033;
  max-width: 42ch;
}

.rec-bleed-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.rec-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 99px;
  border: 1px solid rgba(44, 24, 16, 0.15);
  background: #fff;
  color: #5c4033;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(28, 19, 16, 0.06);
}

.rec-icon-btn:hover {
  border-color: var(--terra, #b5522a);
  color: var(--terra, #b5522a);
}

.rec-icon-btn:focus-visible {
  outline: 2px solid var(--terra, #b5522a);
  outline-offset: 2px;
}

.rec-h-skel-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 5vw, 56px);
}

.rec-h-skel {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(160px, calc((100% - 3 * 12px) / 4));
  gap: 12px;
  overflow: hidden;
  padding: 12px 0;
}

.rec-h-skel-card {
  aspect-ratio: 3 / 4.2;
  border-radius: 10px;
  background: rgba(44, 24, 16, 0.08);
  animation: pulse 1.2s ease-in-out infinite;
}

.rec-h-scroll {
  --rec-gap: 12px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(200px, calc((100% - 3 * var(--rec-gap)) / 4));
  gap: var(--rec-gap);
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px clamp(16px, 5vw, 56px) 16px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: clamp(16px, 5vw, 56px);
  -webkit-overflow-scrolling: touch;
}

.rec-h-scroll:focus-visible {
  outline: 2px solid var(--terra, #b5522a);
  outline-offset: 4px;
}

@media (max-width: 900px) {
  .rec-h-scroll {
    grid-auto-columns: minmax(180px, 42vw);
  }
}

@media (max-width: 520px) {
  .rec-h-scroll {
    grid-auto-columns: minmax(160px, 72vw);
  }
}

.rec-h-card {
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.rec-h-card__visual {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: rgba(44, 24, 16, 0.06);
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  box-shadow: 0 4px 18px rgba(28, 19, 16, 0.1);
}

.rec-h-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.rec-h-card__visual:hover .rec-h-card__img {
  transform: scale(1.03);
}

.rec-h-card__shine {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: linear-gradient(
    125deg,
    transparent 42%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 58%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
}

.rec-h-card__visual:hover .rec-h-card__shine {
  opacity: 1;
}

.rec-h-card__visual:focus-visible {
  outline: 2px solid var(--terra, #b5522a);
  outline-offset: 2px;
}

.rec-h-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 0 2px 4px;
}

.rec-h-card__title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
  color: #2c1810;
}

.rec-h-card__price {
  margin: 0;
  font-size: 0.8rem;
  color: #5c4033;
}

.rec-h-card__link {
  align-self: flex-start;
  margin-top: 2px;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--terra, #b5522a);
  font-weight: 600;
  cursor: pointer;
}

.rec-h-card__link:hover {
  text-decoration: underline;
}

.rec-bleed-empty {
  margin: 0;
  padding: 8px clamp(20px, 5vw, 56px) 0;
  text-align: center;
  color: #5c4033;
  font-size: 0.9rem;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.88;
  }
}
</style>
