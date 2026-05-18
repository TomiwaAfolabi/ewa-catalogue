<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useCheckoutDelivery } from '@/composables/useCheckoutDelivery'
import { useAddressBook, applyShippingSnapshotToDelivery } from '@/composables/useAddressBook'
import type { SavedShippingAddress } from '@/composables/useAddressBook'
import { useToast } from '@/composables/useToast'
import { useWhatsApp } from '@/composables/useWhatsApp'
import type { Product } from '@/types'
import { containsHtmlDelimiters, EMAIL_MAX_LEN, isValidEmail, LIMITS } from '@/utils/formValidation'
import { canPurchaseProduct, productStockQuantity } from '@/utils/inventory'
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
const { openCheckoutOrder } = useWhatsApp()

const notes = ref('')
const guestCheckoutEmail = ref('')
const error = ref('')
const showSavedAddresses = ref(false)

const orderCurrency = computed(
  () => cart.items[0]?.product.currency_symbol ?? '₦',
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

function validateGuestCheckout(): string | null {
  if (auth.isLoggedIn) return null
  const e = guestCheckoutEmail.value.trim()
  if (!e) return null
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
    validateGuestCheckout() === null,
)

const canSubmitOrder = computed(
  () => deliveryFormComplete.value && !cart.hasUnavailableItems && !cart.isEmpty,
)

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

function completeOrderOnWhatsApp() {
  error.value = ''
  const v = validateDelivery()
  if (v) {
    error.value = v
    return
  }
  const n = validateNotes()
  if (n) {
    error.value = n
    return
  }
  const g = validateGuestCheckout()
  if (g) {
    error.value = g
    return
  }
  const bad = cart.items.find((i) => !canPurchaseProduct(i.product))
  if (bad) {
    error.value = `“${bad.product.title}” is out of stock. Remove it from your bag or refresh the collection before continuing.`
    return
  }

  const snap = delivery.snapshot()
  const addr = snap.address
  openCheckoutOrder({
    items: [...cart.items],
    totalNaira: cart.totalPrice,
    delivery: {
      fullName: snap.fullName.trim(),
      phone: snap.phone.trim(),
      line1: addr.line1.trim(),
      line2: addr.line2?.trim() || undefined,
      city: addr.city.trim(),
      state: addr.state?.trim() || undefined,
      postalCode: addr.postalCode?.trim() || undefined,
      country: addr.country?.trim() || undefined,
    },
    notes: notes.value.trim() || undefined,
    email: auth.isLoggedIn
      ? authUser.value?.email
      : guestCheckoutEmail.value.trim().toLowerCase() || undefined,
  })
}
</script>

<template>
  <div class="checkout">
    <div class="checkout-inner">
      <h1 class="title">Checkout</h1>
      <p class="lead">
        Review your bag, enter your delivery details, then send your order on WhatsApp. You can check out as a guest or
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
              {{ line.product.currency_symbol }} {{ (line.product.price * line.quantity).toLocaleString('en-NG') }}
            </span>
          </li>
        </ul>
        <p class="hint">Displayed prices are catalogue estimates.</p>
        <p class="delivery-fee-caveat delivery-fee-caveat--inline" role="note">
          <strong>Delivery not included.</strong>
          The amount is for your piece(s) only, you would be required to pay for delivery fee separately depending on your location.
        </p>
        <p class="order-total">
          <span class="order-total__label">Total</span>
          <span class="order-total__amount">
            {{ orderCurrency }} {{ cart.totalPrice.toLocaleString('en-NG') }}
          </span>
        </p>
        <p v-if="cart.hasUnavailableItems" class="stock-alert" role="alert">
          One or more items are out of stock. Remove them to continue.
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
        <label v-if="!auth.isLoggedIn" class="field">
          <span>Email (optional)</span>
          <input
            v-model="guestCheckoutEmail"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
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
            :disabled="!savedAddresses.length"
            @click="showSavedAddresses = true"
          >
            Choose saved address
          </button>
          <button type="button" class="btn-addr btn-addr--secondary" @click="saveCurrentAddressToBook">
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
        <button type="button" class="btn-ghost" @click="router.push({ name: 'catalogue' })">
          Continue shopping
        </button>
        <button
          type="button"
          class="btn-whatsapp"
          :disabled="cart.isEmpty || !canSubmitOrder"
          @click="completeOrderOnWhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Complete order on WhatsApp
        </button>
      </div>

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

.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 22px;
  border: 1px solid rgba(37, 211, 102, 0.35);
  border-radius: var(--radius-sm);
  background: rgba(37, 211, 102, 0.14);
  color: #25d366;
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-whatsapp:hover:not(:disabled) {
  background: rgba(37, 211, 102, 0.22);
  border-color: rgba(37, 211, 102, 0.55);
}
.btn-whatsapp:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn-whatsapp:focus-visible {
  outline: 2px solid #25d366;
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  .actions .btn-ghost,
  .actions .btn-whatsapp {
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
