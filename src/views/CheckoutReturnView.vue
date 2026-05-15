<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const message = ref('Verifying payment…')
const ok = ref(false)

onMounted(async () => {
  const refParam =
    (typeof route.query.reference === 'string' && route.query.reference) ||
    (typeof route.query.trxref === 'string' && route.query.trxref) ||
    ''

  if (!refParam) {
    message.value = 'Missing payment reference. If you completed payment, check your email or orders.'
    return
  }

  try {
    const res = await api.payments.verifyPaystack(refParam)
    if (res.data.order?.status === 'PAID') {
      ok.value = true
      message.value = 'Payment successful. Thank you for your order.'
      cart.clearCart()
      sessionStorage.removeItem('ewa_checkout_order_id')
    } else if (res.data.ok && res.data.order) {
      message.value = `Order status: ${res.data.order.status}. If payment succeeded, status will update shortly.`
    } else {
      message.value = res.data.message || 'Could not verify payment yet.'
    }
  } catch (e) {
    message.value = e instanceof Error ? e.message : 'Verification failed'
  }
})
</script>

<template>
  <div class="wrap">
    <div class="card" :class="{ success: ok }">
      <h1 class="title">{{ ok ? 'Thank you' : 'Payment' }}</h1>
      <p class="msg">{{ message }}</p>
      <div class="row">
        <button type="button" class="btn" @click="router.push({ name: 'home' })">
          Back to home
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

.btn-primary {
  background: var(--terra);
  color: var(--ivory);
}
</style>
