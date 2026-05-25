<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useCheckoutDelivery } from '@/composables/useCheckoutDelivery'
import { useAddressBook, applyShippingSnapshotToDelivery } from '@/composables/useAddressBook'
import type { SavedShippingAddress } from '@/composables/useAddressBook'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'
import type { CreatedOrder, Product } from '@/types'
import { containsHtmlDelimiters, EMAIL_MAX_LEN, isValidEmail, LIMITS } from '@/utils/formValidation'
import { checkoutReturnUrl } from '@/config/site'
import { canPurchaseProduct, productStockQuantity } from '@/utils/inventory'
import { formatNairaAmount, formatNairaFromKobo, productUnitPriceKobo } from '@/utils/pricing'
import {
  cartCheckoutFingerprint,
  ensureOrderIdempotencyKey,
  getOrCreatePayIdempotencyKey,
} from '@/utils/checkoutIdempotency'
import SavedAddressesModal from '@/components/checkout/SavedAddressesModal.vue'

function productImageSrc(p: Product): string {
  return (p.imgSrc || p.images?.[0] || '').trim()
}

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const { user: authUser } = storeToRefs(auth)

const userId = computed(() => authUser.value?.id)
const delivery = useCheckoutDelivery(userId, authUser)
const { addresses: savedAddresses, addFromSnapshot, remove: removeSavedAddress } =
  useAddressBook(userId)
const toast = useToast()

const notes = ref('')
const guestCheckoutEmail = ref('')
const error = ref('')
const busy = ref(false)
const createdOrder = ref<CreatedOrder | null>(null)
const showSavedAddresses = ref(false)

const callbackUrl = computed(() => checkoutReturnUrl())

let checkoutInFlight: Promise<void> | null = null

const cartFingerprint = computed(() =>
  cartCheckoutFingerprint(cart.items, checkoutEmailForPayload()),
)

const orderCurrency = computed(
  () => cart.items[0]?.product.currency_symbol ?? '₦',
)

function checkoutEmailForPayload(): string {
  const fromField = guestCheckoutEmail.value.trim().toLowerCase()
  const fromAuth = authUser.value?.email?.trim().toLowerCase() ?? ''
  return fromField || fromAuth
}

function syncCheckoutIdempotencyKey() {
  if (cart.isEmpty) return
  ensureOrderIdempotencyKey(cartFingerprint.value)
}

onMounted(async () => {
  syncCheckoutIdempotencyKey()
  if (auth.isLoggedIn && !authUser.value) {
    await auth.fetchMe()
  }
})

watch(cartFingerprint, syncCheckoutIdempotencyKey)

watch(guestCheckoutEmail, () => {
  if (!cart.isEmpty) syncCheckoutIdempotencyKey()
})

watch(
  () => authUser.value?.email,
  (email) => {
    if (email?.trim() && !guestCheckoutEmail.value.trim()) {
      guestCheckoutEmail.value = email.trim()
    }
  },
  { immediate: true },
)

watch(
  () => cart.isEmpty,
  empty => {
    if (empty) {
      void router.replace({ name: 'catalogue' })
    }
  },
  { immediate: true },
)

function validateDelivery(): string | null {
  const fn = (delivery.fullName ?? '').trim()
  if (!fn) return 'Please enter your full name.'
  if (fn.length > LIMITS.fullName) {
    return `Full name must be at most ${LIMITS.fullName} characters.`
  }
  if (containsHtmlDelimiters(fn)) {
    return 'Full name cannot contain the characters < or >.'
  }

  const ph = (delivery.phone ?? '').trim()
  if (!ph) return 'Please enter a phone number.'
  if (ph.length > LIMITS.phone) {
    return `Phone number looks too long (max ${LIMITS.phone} characters).`
  }
  if (containsHtmlDelimiters(ph)) {
    return 'Phone number cannot contain the characters < or >.'
  }

  const l1 = (delivery.line1 ?? '').trim()
  if (!l1) return 'Please enter address line 1.'
  if (l1.length > LIMITS.addressLine) {
    return `Address line 1 must be at most ${LIMITS.addressLine} characters.`
  }
  if (containsHtmlDelimiters(l1)) {
    return 'Address line 1 cannot contain the characters < or >.'
  }

  const l2 = (delivery.line2 ?? '').trim()
  if (l2.length > LIMITS.addressLine) {
    return `Address line 2 must be at most ${LIMITS.addressLine} characters.`
  }
  if (containsHtmlDelimiters(l2)) {
    return 'Address line 2 cannot contain the characters < or >.'
  }

  const cy = (delivery.city ?? '').trim()
  if (!cy) return 'Please enter city / town.'
  if (cy.length > LIMITS.city) {
    return `City must be at most ${LIMITS.city} characters.`
  }
  if (containsHtmlDelimiters(cy)) {
    return 'City cannot contain the characters < or >.'
  }

  const st = (delivery.state ?? '').trim()
  if (st.length > LIMITS.state) {
    return `State or region must be at most ${LIMITS.state} characters.`
  }
  if (containsHtmlDelimiters(st)) {
    return 'State cannot contain the characters < or >.'
  }

  const pc = (delivery.postalCode ?? '').trim()
  if (pc.length > LIMITS.postalCode) {
    return `Postal code must be at most ${LIMITS.postalCode} characters.`
  }
  if (containsHtmlDelimiters(pc)) {
    return 'Postal code cannot contain the characters < or >.'
  }

  const co = (delivery.country ?? '').trim() || 'NG'
  if (co.length > LIMITS.country) {
    return `Country must be at most ${LIMITS.country} characters.`
  }
  if (containsHtmlDelimiters(co)) {
    return 'Country cannot contain the characters < or >.'
  }

  return null
}

function validateNotes(): string | null {
  const n = notes.value.trim()
  if (!n) return null
  if (n.length > LIMITS.orderNotes) {
    return `Order notes must be at most ${LIMITS.orderNotes} characters.`
  }
  if (containsHtmlDelimiters(n)) {
    return 'Order notes cannot contain < or > (not allowed for security).'
  }
  return null
}

function validateCheckoutEmail(): string | null {
  const e = checkoutEmailForPayload()
  if (!e) return 'Please enter your email (for Paystack and your receipt).'
  if (e.length > EMAIL_MAX_LEN) return 'Email address is too long.'
  if (!isValidEmail(e)) return 'Please enter a valid email address.'
  if (containsHtmlDelimiters(e)) return 'Email cannot contain the characters < or >.'
  return null
}

/** Required (non-optional) checkout fields — mirrors `validateDelivery` + notes rules. */
const deliveryFormComplete = computed(
  () =>
    validateDelivery() === null &&
    validateNotes() === null &&
    validateCheckoutEmail() === null,
)

const canSubmitPayment = computed(
  () =>
    deliveryFormComplete.value &&
    !cart.hasUnavailableItems &&
    !cart.isEmpty &&
    !busy.value,
)

function reportCheckoutError(message: string) {
  error.value = message
  toast.error(message)
}

function saveCurrentAddressToBook() {
  const v = validateDelivery()
  if (v) {
    error.value = v
    return
  }
  const ok = addFromSnapshot(delivery.snapshot())
  if (ok) toast.success('Address saved to your list.')
  else error.value = 'Could not save address. Check all required fields are filled.'
}

function applySavedAddress(addr: SavedShippingAddress) {
  applyShippingSnapshotToDelivery(delivery, addr)
  showSavedAddresses.value = false
  error.value = ''
}

async function runCheckout(): Promise<void> {
  if (auth.isLoggedIn && !authUser.value) {
    await auth.fetchMe()
  }

  const email = checkoutEmailForPayload()
  if (!email) {
    reportCheckoutError('Please enter your email (for Paystack and your receipt).')
    throw new Error('guestCheckoutEmail required')
  }

  const orderIdempotencyKey = ensureOrderIdempotencyKey(cartFingerprint.value)
  const shippingSnapshot = {
    ...(delivery.snapshot() as unknown as Record<string, unknown>),
    guestCheckoutEmail: email,
  }
  const base = cart.getOrderPayload({
    notes: notes.value.trim() || undefined,
    shippingSnapshot,
  })

  const payload = {
    items: base.items,
    ...(base.notes != null ? { notes: base.notes } : {}),
    ...(base.shippingAmount != null ? { shippingAmount: base.shippingAmount } : {}),
    ...(base.taxAmount != null ? { taxAmount: base.taxAmount } : {}),
    shippingSnapshot: base.shippingSnapshot,
    guestCheckoutEmail: email,
  }

  const skipAuth = !authUser.value?.id

  toast.info('Submitting your order…')
  const orderRes = await api.orders.create(payload, orderIdempotencyKey, { skipAuth })
  createdOrder.value = orderRes.data
  sessionStorage.setItem('ewa_checkout_order_id', orderRes.data.id)

  if (orderRes.data.replayed) {
    toast.info('Resuming your existing order.')
  } else {
    toast.success('Order created.')
  }

  toast.info('Kindly wait while we redirect you to Paystack checkout…')
  const payIdempotencyKey = getOrCreatePayIdempotencyKey(orderRes.data.id)
  const payRes = await api.payments.initializePaystack(
    {
      orderId: orderRes.data.id,
      callbackUrl: callbackUrl.value,
      expectedOrderTotalKobo: orderRes.data.total,
      guestCheckoutEmail: email,
    },
    payIdempotencyKey,
    { skipAuth },
  )

  if (payRes.data.replayed) {
    toast.info('Resuming your Paystack payment session.')
  }

  window.location.href = payRes.data.authorizationUrl
}

async function payWithPaystack() {
  error.value = ''
  const v = validateDelivery()
  if (v) {
    reportCheckoutError(v)
    return
  }
  const n = validateNotes()
  if (n) {
    reportCheckoutError(n)
    return
  }
  const g = validateCheckoutEmail()
  if (g) {
    reportCheckoutError(g)
    return
  }
  const bad = cart.items.find((i) => !canPurchaseProduct(i.product))
  if (bad) {
    reportCheckoutError(
      `“${bad.product.title}” is out of stock. Remove it from your bag or refresh the collection before paying.`,
    )
    return
  }

  let inflight = checkoutInFlight
  if (!inflight) {
    busy.value = true
    inflight = (async () => {
      try {
        await runCheckout()
    } catch (e) {
      let msg = e instanceof Error ? e.message : 'Checkout failed'
      if (/guestCheckoutEmail/i.test(msg)) {
        msg =
          'Please enter your email or sign in again if you were logged in.'
      }
      reportCheckoutError(msg)
      busy.value = false
      throw e
    }
    })()
    checkoutInFlight = inflight
  }

  try {
    await inflight
  } finally {
    if (checkoutInFlight === inflight) checkoutInFlight = null
  }
}
</script>

<template>
  <div class="checkout">
    <div class="checkout-inner">
      <h1 class="title">Checkout</h1>
      <p class="lead">
        Review your bag, enter your delivery details, and pay securely with Paystack. You can check out as a guest or
        sign in to reuse saved addresses.
      </p>

      <section v-if="!cart.isEmpty" class="panel">
        <h2 class="section-title">Items</h2>
        <ul class="lines">
          <li
            v-for="line in cart.items"
            :key="`${line.product.id}:${line.selectedSize ?? ''}`"
            class="line"
          >
            <div class="line-main">
              <div class="line-thumb-wrap">
                <img
                  v-if="productImageSrc(line.product)"
                  class="line-thumb"
                  :src="productImageSrc(line.product)"
                  :alt="line.product.title"
                  loading="lazy"
                  decoding="async"
                >
                <div v-else class="line-thumb line-thumb--empty" aria-hidden="true" />
              </div>
              <div class="line-copy">
                <span class="line-title">{{ line.product.title }}</span>
                <span v-if="line.selectedSize" class="line-meta">Size {{ line.selectedSize }}</span>
                <span class="line-qty">× {{ line.quantity }}</span>
                <span class="line-stock" :class="{ 'line-stock--out': !canPurchaseProduct(line.product) }">
                  In stock: {{ productStockQuantity(line.product) }}
                </span>
              </div>
            </div>
            <span class="line-total">
              {{ formatNairaFromKobo(productUnitPriceKobo(line.product) * line.quantity, line.product.currency_symbol) }}
            </span>
          </li>
        </ul>
      
        <p class="delivery-fee-caveat delivery-fee-caveat--inline" role="note">
          <strong>Please note that the delivery fee is not included and we only deliver within Lagos state, Nigeria at the moment.</strong>
          The amount is for the items selected only, you would be required to pay for delivery fee separately depending on your location. You can always make enquires regarding delivery via our email or by clicking the enquiry button on the specific item page. Thank you.
        </p>
        <p class="order-total">
          <span class="order-total__label">Total</span>
          <span class="order-total__amount">
            {{ formatNairaAmount(cart.totalPrice, orderCurrency) }}
          </span>
        </p>
        <p v-if="cart.hasUnavailableItems" class="stock-alert" role="alert">
          One or more items are out of stock. Remove them to continue to payment.
        </p>
      </section>

      <section class="panel">
        <h2 class="section-title">Contact &amp; name</h2>
        <p v-if="authUser?.email" class="email-line">
          Signed in as <strong>{{ authUser.email }}</strong>
        </p>
        <label class="field">
          <span>Full name</span>
          <input
            v-model="delivery.fullName"
            type="text"
            autocomplete="name"
            required
            :maxlength="LIMITS.fullName"
          >
        </label>
        <label class="field">
          <span>Email (for payment &amp; receipt)</span>
          <input
            v-model="guestCheckoutEmail"
            type="email"
            autocomplete="email"
            required
            :placeholder="authUser?.email ? authUser.email : 'you@example.com'"
            :maxlength="EMAIL_MAX_LEN"
          >
        </label>
        <label class="field">
          <span>Phone (for delivery coordination)</span>
          <input
            v-model="delivery.phone"
            type="tel"
            autocomplete="tel"
            required
            placeholder="+234…"
            :maxlength="LIMITS.phone"
          >
        </label>
      </section>

      <section class="panel">
        <h2 class="section-title">Delivery address</h2>
        <label class="field">
          <span>Address line 1</span>
          <input
            v-model="delivery.line1"
            type="text"
            autocomplete="address-line1"
            required
            placeholder="Street, building, number"
            :maxlength="LIMITS.addressLine"
          >
        </label>
        <label class="field">
          <span>Address line 2 (optional)</span>
          <input
            v-model="delivery.line2"
            type="text"
            autocomplete="address-line2"
            placeholder="Apartment, suite, landmark"
            :maxlength="LIMITS.addressLine"
          >
        </label>
        <div class="field-row">
          <label class="field">
            <span>City / town</span>
            <input
              v-model="delivery.city"
              type="text"
              autocomplete="address-level2"
              required
              :maxlength="LIMITS.city"
            >
          </label>
          <label class="field">
            <span>State / region</span>
            <input
              v-model="delivery.state"
              type="text"
              autocomplete="address-level1"
              :maxlength="LIMITS.state"
            >
          </label>
        </div>
        <div class="field-row">
          <label class="field">
            <span>Postal code (optional)</span>
            <input
              v-model="delivery.postalCode"
              type="text"
              autocomplete="postal-code"
              :maxlength="LIMITS.postalCode"
            >
          </label>
          <label class="field">
            <span>Country</span>
            <input
              v-model="delivery.country"
              type="text"
              autocomplete="country-name"
              placeholder="NG"
              :maxlength="LIMITS.country"
            >
          </label>
        </div>
        <p class="hint hint--tight">Country as you want it on the label (e.g. NG).</p>
        <div class="address-book-row">
          <button
            type="button"
            class="btn-addr"
            :disabled="busy || !savedAddresses.length"
            @click="showSavedAddresses = true"
          >
            Choose saved address
          </button>
          <button
            type="button"
            class="btn-addr btn-addr--secondary"
            :disabled="busy"
            @click="saveCurrentAddressToBook"
          >
            Save current address
          </button>
        </div>
      </section>

      <section class="panel">
        <h2 class="section-title">Order notes</h2>
        <label class="field">
          <span>Notes (optional)</span>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="Delivery instructions, sizing notes…"
            :maxlength="LIMITS.orderNotes"
          />
        </label>
      </section>

      <label class="remember">
        <input v-model="delivery.rememberOnDevice" type="checkbox">
        <span>Remember my details on this device for next time</span>
      </label>
      <p class="remember-hint">
        <template v-if="auth.isLoggedIn">
          Saved only in your browser, tied to your account. Uncheck to clear saved details.
        </template>
        <template v-else>Saved only in this browser on this device. Uncheck to clear.</template>
      </p>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <div class="actions">
        <button type="button" class="btn-ghost" :disabled="busy" @click="router.push({ name: 'catalogue' })">
          Continue shopping
        </button>
        <button
          type="button"
          class="btn-pay"
          :disabled="busy || cart.isEmpty || !canSubmitPayment"
          @click="payWithPaystack"
        >
          {{ busy ? 'Preparing Paystack…' : 'Pay with Paystack' }}
        </button>
      </div>

      <p v-if="createdOrder && busy" class="redirect-note">
        Redirecting to Paystack for order {{ createdOrder.id.slice(0, 8) }}…
      </p>

    </div>

    <SavedAddressesModal
      :open="showSavedAddresses"
      :addresses="savedAddresses"
      @close="showSavedAddresses = false"
      @select="applySavedAddress"
      @remove="removeSavedAddress"
    />
  </div>
</template>

<style scoped>
.checkout {
  min-height: calc(100vh - 72px);
  padding: 32px 20px 64px;
  background: rgba(28, 19, 16, 0.78);
}

.checkout-inner {
  max-width: 640px;
  margin: 0 auto;
  color: #faf6ef;
}

.title {
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.85rem;
}

.lead {
  margin: 0 0 28px;
  opacity: 0.88;
  font-size: 0.95rem;
}

.panel {
  background: rgba(250, 246, 239, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: 10px;
  padding: 20px 18px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 14px;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
}

.email-line {
  margin: 0 0 16px;
  font-size: 0.85rem;
  opacity: 0.88;
}

.email-line strong {
  font-weight: 600;
  color: #faf6ef;
}

.lines {
  list-style: none;
  margin: 0;
  padding: 0;
}

.line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  font-size: 0.9rem;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.line-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.line-thumb-wrap {
  flex-shrink: 0;
  width: 72px;
  height: 92px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(12, 8, 6, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.line-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.line-thumb--empty {
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: rgba(255, 255, 255, 0.06);
}

.line-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.line-title {
  font-weight: 600;
  line-height: 1.3;
}

.line-meta {
  font-size: 0.78rem;
  opacity: 0.75;
  text-transform: none;
  letter-spacing: 0.02em;
}

.line-qty {
  font-size: 0.8rem;
  opacity: 0.8;
}

.line-total {
  flex-shrink: 0;
  font-weight: 600;
  white-space: nowrap;
}

.hint {
  margin: 14px 0 0;
  font-size: 0.75rem;
  opacity: 0.75;
  line-height: 1.45;
}

.hint--tight {
  margin-top: 6px;
}

.stock-alert {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(181, 82, 42, 0.45);
  background: rgba(181, 82, 42, 0.12);
  font-size: 0.82rem;
  color: #f0d8cf;
}

.address-book-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(232, 196, 168, 0.4);
  background: rgba(250, 246, 239, 0.07);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.18);
}

.btn-addr {
  flex: 1 1 200px;
  min-height: 48px;
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--terra);
  background: var(--terra);
  color: var(--ivory);
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.12s ease;
}

.btn-addr:not(:disabled):hover {
  filter: brightness(1.08);
}

.btn-addr:not(:disabled):active {
  transform: scale(0.98);
}

.btn-addr:focus-visible {
  outline: 2px solid var(--ivory);
  outline-offset: 3px;
}

.btn-addr:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  filter: grayscale(0.25) brightness(0.85);
}

.btn-addr--secondary {
  background: rgba(250, 246, 239, 0.12);
  border: 2px solid rgba(232, 196, 168, 0.85);
  color: var(--ivory);
}

.btn-addr--secondary:not(:disabled):hover {
  background: rgba(250, 246, 239, 0.2);
  border-color: var(--terra-light);
  filter: none;
}

.line-stock {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(139, 211, 160, 0.9);
}

.line-stock--out {
  color: rgba(255, 160, 140, 0.95);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.75);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 520px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}

.field input,
.field textarea {
  padding: 12px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(12, 8, 6, 0.45);
  color: #faf6ef;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: normal;
}

.field input:focus,
.field textarea:focus {
  outline: 2px solid var(--gold);
  outline-offset: 1px;
}

.remember {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 8px 0 6px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(250, 246, 239, 0.92);
  cursor: pointer;
}

.remember input {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: var(--gold);
  cursor: pointer;
}

.remember-hint {
  margin: 0 0 20px;
  font-size: 0.72rem;
  opacity: 0.65;
  line-height: 1.45;
}

.error {
  color: #ffb4a8;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.btn-ghost {
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(250, 246, 239, 0.35);
  background: transparent;
  color: #faf6ef;
  cursor: pointer;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.btn-ghost:disabled {
  opacity: 0.5;
}

.btn-pay {
  padding: 14px 22px;
  border: none;
  border-radius: var(--radius-sm);
  background: #0c9;
  color: #0a1f18;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}
.btn-pay:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn-pay:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}

.redirect-note {
  margin-top: 16px;
  font-size: 0.85rem;
  opacity: 0.85;
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  .actions .btn-ghost,
  .actions .btn-pay {
    width: 100%;
    text-align: center;
    box-sizing: border-box;
  }
}

.order-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 20px 0 0;
  padding-top: 16px;
  border-top: 1px solid rgba(250, 246, 239, 0.12);
}

.order-total__label {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.75;
}

.order-total__amount {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 400;
  color: var(--gold, #c9a84c);
}
</style>
