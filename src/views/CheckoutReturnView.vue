<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/composables/useToast'
import { clearCheckoutIdempotencyKeys } from '@/utils/checkoutIdempotency'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const toast = useToast()

const message = ref('Verifying payment…')
const ok = ref(false)
const verifying = ref(true)

onMounted(async () => {
  const refParam =
    (typeof route.query.reference === 'string' && route.query.reference) ||
    (typeof route.query.trxref === 'string' && route.query.trxref) ||
    ''

  if (!refParam) {
    verifying.value = false
    message.value = 'Missing payment reference. If you completed payment, check your email or orders.'
    toast.error('No payment reference found in the return link.')
    return
  }

  toast.info('Verifying your Paystack payment…')
  try {
    const res = await api.payments.verifyPaystack(refParam)
    verifying.value = false
    if (res.data.order?.status === 'PAID') {
      ok.value = true
      message.value = 'Payment successful. Thank you for your order.'
      cart.clearCart()
      clearCheckoutIdempotencyKeys()
      toast.success('Payment confirmed. Thank you for your order.')
    } else if (res.data.ok && res.data.order) {
      message.value = `Order status: ${res.data.order.status}. If payment succeeded, status will update shortly.`
      toast.info(message.value)
    } else {
      message.value = res.data.message || 'Could not verify payment yet.'
      toast.error(message.value)
    }
  } catch (e) {
    verifying.value = false
    message.value = e instanceof Error ? e.message : 'Verification failed'
    toast.error(message.value)
  }
})
</script>

<template>
  <div class="wrap">
    <div class="card" :class="{ success: ok }">
      <h1 class="title">{{ ok ? 'Thank you' : verifying ? 'Payment' : 'Payment status' }}</h1>
      <p class="msg" role="status">{{ message }}</p>
      <div class="row">
        <button type="button" class="btn" @click="router.push({ name: 'home' })">
          Back to home
        </button>
        <button
          v-if="!ok && !verifying"
          type="button"
          class="btn secondary"
          @click="router.push({ name: 'catalogue' })"
        >
          Continue shopping
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(28, 19, 16, 0.75);
}

.card {
  max-width: 440px;
  padding: 36px 28px;
  border-radius: 12px;
  background: #faf6ef;
  text-align: center;
  border: 1px solid rgba(44, 24, 16, 0.12);
}

.card.success {
  border-color: rgba(12, 153, 105, 0.35);
}

.title {
  margin: 0 0 12px;
  font-family: var(--font-serif);
  font-weight: 400;
  color: #2c1810;
}

.msg {
  margin: 0 0 24px;
  line-height: 1.5;
  color: #5c4033;
  font-size: 0.95rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--terra);
  color: var(--ivory);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.btn.secondary {
  background: transparent;
  border: 1px solid rgba(44, 24, 16, 0.25);
  color: #2c1810;
}
</style>
