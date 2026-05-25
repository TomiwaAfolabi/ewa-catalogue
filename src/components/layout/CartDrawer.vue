<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/composables/useToast'
import { canPurchaseProduct } from '@/utils/inventory'
import { formatNairaAmount, formatNairaFromKobo, productUnitPriceKobo } from '@/utils/pricing'

const router = useRouter()
const cart = useCartStore()
const toast = useToast()

const cartBlocked = computed(() => cart.hasUnavailableItems)

function formatLine(product: (typeof cart.items)[0]['product'], qty: number) {
  return formatNairaFromKobo(productUnitPriceKobo(product) * qty, product.currency_symbol)
}

function checkout() {
  if (cart.hasUnavailableItems) {
    toast.error('Remove out-of-stock items before checkout.')
    return
  }
  cart.closeCart()
  toast.info('Continue to Paystack checkout on the next page.')
  void router.push({ name: 'checkout' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="cart.isOpen"
        class="drawer-root"
        aria-modal="true"
        role="dialog"
        aria-label="Shopping cart"
      >
        <button type="button" class="drawer-backdrop" aria-label="Close cart" @click="cart.closeCart()" />
        <aside class="drawer-panel">
          <header class="drawer-head">
            <h2 class="drawer-title">Your cart</h2>
            <button type="button" class="drawer-close" aria-label="Close cart" @click="cart.closeCart()">
              ×
            </button>
          </header>

          <div v-if="cart.isEmpty" class="drawer-empty">
            <p>Your cart is empty.</p>
            <button type="button" class="btn-link" @click="cart.closeCart(); router.push({ name: 'catalogue' })">
              Browse collection
            </button>
          </div>

          <template v-else>
            <ul class="drawer-list">
              <li v-for="line in cart.items" :key="line.product.id" class="drawer-line">
                <div class="drawer-line__media">
                  <img
                    :src="line.product.imgSrc"
                    :alt="line.product.title"
                    class="line-thumb"
                    loading="lazy"
                    decoding="async"
                  >
                </div>
                <div class="line-body">
                  <p class="line-title">{{ line.product.title }}</p>
                  <p v-if="line.selectedSize" class="line-meta">Size: {{ line.selectedSize }}</p>
                  <p v-if="!canPurchaseProduct(line.product)" class="line-stock-warn" role="status">
                    Out of stock — remove to check out
                  </p>
                  <p class="line-price">
                    {{ formatLine(line.product, line.quantity) }}
                  </p>
                  <div class="line-qty">
                    <button
                      type="button"
                      class="qty-btn"
                      :aria-label="`Decrease quantity of ${line.product.title}`"
                      @click="cart.updateQuantity(line.product.id, line.quantity - 1)"
                    >
                      −
                    </button>
                    <span class="qty-val">{{ line.quantity }}</span>
                    <button
                      type="button"
                      class="qty-btn"
                      :aria-label="`Increase quantity of ${line.product.title}`"
                      @click="cart.updateQuantity(line.product.id, line.quantity + 1)"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      class="remove-btn"
                      @click="cart.removeItem(line.product.id)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <footer class="drawer-foot">
              <div class="drawer-total">
                <span>Estimated total</span>
                <strong>
                  {{ formatNairaAmount(cart.totalPrice, cart.items[0]?.product.currency_symbol) }}
                </strong>
              </div>
              <p class="drawer-note">
                Final amount is confirmed at checkout
              </p>
              <p v-if="cartBlocked" class="drawer-stock-alert" role="alert">
                Remove out-of-stock items to continue to checkout.
              </p>
              <button type="button" class="btn-checkout" :disabled="cartBlocked" @click="checkout">
                Checkout with Paystack
              </button>
            </footer>
          </template>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(12, 8, 6, 0.55);
  border: none;
  cursor: pointer;
}

.drawer-panel {
  position: relative;
  width: min(460px, 100vw);
  height: 100%;
  background: #faf6ef;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.28s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(181, 82, 42, 0.15);
  flex-shrink: 0;
}

.drawer-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 400;
  color: #2c1810;
}

.drawer-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: #5c4033;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}
.drawer-close:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 2px;
}

.drawer-empty {
  padding: 32px 24px;
  text-align: center;
  color: #5c4033;
}

.btn-link {
  margin-top: 12px;
  background: none;
  border: none;
  color: var(--terra);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
}

.drawer-list {
  list-style: none;
  margin: 0;
  padding: 8px 20px 16px;
  overflow-y: auto;
  flex: 1;
}

.drawer-line {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 18px 0;
  border-bottom: 1px solid rgba(44, 24, 16, 0.08);
}

.drawer-line:last-child {
  border-bottom: none;
}

.drawer-line__media {
  flex: 0 0 50%;
  width: 50%;
  max-width: 50%;
  padding-right: 14px;
  box-sizing: border-box;
  align-self: flex-start;
}

.line-thumb {
  width: 100%;
  height: 150px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  background: rgba(44, 24, 16, 0.06);
}

.line-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;
  padding-top: 2px;
}

.line-title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: #2c1810;
  line-height: 1.35;
}

.line-meta {
  margin: 0;
  font-size: 0.75rem;
  color: #6b5344;
}

.line-stock-warn {
  margin: 0 0 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #b5522a;
}

.line-price {
  margin: 0 0 6px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #3d2a22;
}

.line-qty {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid rgba(44, 24, 16, 0.2);
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.qty-btn:focus-visible {
  outline: 2px solid var(--terra);
}

.qty-val {
  min-width: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c1810;
}

.remove-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--terra);
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px 0;
}

.drawer-foot {
  padding: 18px 22px 28px;
  border-top: 1px solid rgba(181, 82, 42, 0.15);
  background: rgba(255, 255, 255, 0.72);
  flex-shrink: 0;
}

.drawer-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #3d2a22;
}

.drawer-total strong {
  font-size: 1.15rem;
}

.drawer-note {
  margin: 0 0 14px;
  font-size: 0.72rem;
  color: #6b5344;
  line-height: 1.45;
}

.drawer-stock-alert {
  margin: 0 0 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(181, 82, 42, 0.12);
  border: 1px solid rgba(181, 82, 42, 0.35);
  font-size: 0.78rem;
  color: #5c2e22;
}

.btn-checkout {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--terra);
  color: var(--ivory);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-checkout:hover {
  opacity: 0.92;
}
.btn-checkout:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-checkout:focus-visible {
  outline: 2px solid #2c1810;
  outline-offset: 3px;
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .drawer-panel,
.drawer-fade-leave-active .drawer-panel {
  transition: transform 0.2s ease;
}
.drawer-fade-enter-from .drawer-panel,
.drawer-fade-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
