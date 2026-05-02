<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { useWhatsApp } from '@/composables/useWhatsApp'
import ProductImageSlider from '@/components/catalogue/ProductImageSlider.vue'
import SizeGuide from '@/components/catalogue/SizeGuide.vue'

const route  = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore    = useCartStore()
const { enquireAboutProduct } = useWhatsApp()

onMounted(async () => {
  await productStore.fetchProductById(route.params.id as string)
})

onUnmounted(() => {
  productStore.clearCurrentProduct()
})

function handleAddToCart() {
  if (productStore.currentProduct) {
    cartStore.addItem(productStore.currentProduct)
  }
}

function formatPrice(price: number, symbol: string) {
  return `${symbol} ${price.toLocaleString('en-NG')}`
}
</script>

<template>
  <div class="detail-view">

    <!-- Loading -->
    <div v-if="productStore.loading" class="state-overlay">
      <div class="loading-pulse">
        <div class="section-label" style="text-align:center;">Loading piece...</div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="productStore.error" class="state-overlay">
      <p class="error-text">{{ productStore.error }}</p>
      <button class="btn-ghost" @click="router.push({ name: 'catalogue' })">
        ← Back to catalogue
      </button>
    </div>

    <!-- Product detail -->
    <template v-else-if="productStore.currentProduct">
      <div class="detail-inner">

        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <button class="breadcrumb-link" @click="router.push({ name: 'catalogue' })">
            ← Back to Collection
          </button>
        </nav>

        <!-- Content grid -->
        <div class="detail-grid">
          <!-- Left: images -->
          <div class="detail-images">
            <ProductImageSlider
              :images="productStore.currentProduct.images"
              :title="productStore.currentProduct.title"
            />
          </div>

          <!-- Right: info -->
          <div class="detail-info">
            <div class="section-label">Ewa Collection</div>
            <h1 class="detail-title">{{ productStore.currentProduct.title }}</h1>
            <p class="detail-price">
              {{ formatPrice(productStore.currentProduct.price, productStore.currentProduct.currency_symbol) }}
            </p>

            <div class="detail-divider" />

            <!-- Size guide -->
            <SizeGuide :sizes="productStore.currentProduct.sizes" />

            <!-- Actions -->
            <div class="detail-actions">
              <!-- Add to Cart (wired to cartStore, ready for checkout) -->
              <button class="btn-primary btn-full" @click="handleAddToCart">
                Add to Cart
              </button>

              <!-- WhatsApp enquiry -->
              <button class="whatsapp-btn" @click="enquireAboutProduct(productStore.currentProduct!.title)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enquire on WhatsApp
              </button>
            </div>

            <!-- Payment note -->
            <div class="payment-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              <p>To order, tap "Enquire on WhatsApp" and our team will assist you with payment and delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-view {
  background: rgba(28, 19, 16, 0.75);
  min-height: 100vh;
  padding: 48px;
}

/* ── States ──────────────────── */
.state-overlay {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.loading-pulse {
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}

.error-text {
  color: var(--terra-light);
  font-size: 15px;
  letter-spacing: 0.05em;
}

/* ── Layout ──────────────────── */
.detail-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb { margin-bottom: 40px; }

.breadcrumb-link {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: color var(--transition-base);
  padding: 0;
}
.breadcrumb-link:hover { color: var(--terra); }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}

/* ── Info ─────────────────────── */
.detail-title {
  font-family: var(--font-serif);
  font-size: clamp(24px, 3vw, 40px);
  font-weight: 300;
  color: var(--ivory);
  margin-bottom: 12px;
  line-height: 1.15;
}

.detail-price {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 300;
  color: var(--gold);
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.detail-divider {
  width: 60px;
  height: 1px;
  background: linear-gradient(to right, var(--terra), transparent);
  margin: 28px 0;
}

/* ── Actions ──────────────────── */
.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.btn-full { width: 100%; text-align: center; }

.whatsapp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 24px;
  background: rgba(37, 211, 102, 0.12);
  border: 1px solid rgba(37, 211, 102, 0.3);
  color: #25d366;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-weight: 400;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-base), border-color var(--transition-base);
}
.whatsapp-btn:hover {
  background: rgba(37, 211, 102, 0.2);
  border-color: rgba(37, 211, 102, 0.5);
}

/* ── Payment note ─────────────── */
.payment-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 16px;
  background: rgba(201, 168, 76, 0.06);
  border-left: 2px solid rgba(201, 168, 76, 0.3);
}

.payment-note svg { flex-shrink: 0; color: var(--gold); margin-top: 1px; }

.payment-note p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--muted);
  font-weight: 300;
  letter-spacing: 0.02em;
}

/* ── Responsive ───────────────── */
@media (max-width: 900px) {
  .detail-view { padding: 32px 20px; }
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
</style>
