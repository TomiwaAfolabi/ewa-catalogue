<script setup lang="ts">
import type { Product } from '@/types'

defineProps<{ product: Product }>()
const emit = defineEmits<{ click: [product: Product] }>()

function formatPrice(price: number, symbol: string) {
  return `${symbol} ${price.toLocaleString('en-NG')}`
}
</script>

<template>
  <article
    class="product-card"
    role="button"
    tabindex="0"
    :aria-label="`View ${product.title}`"
    @click="emit('click', product)"
    @keydown.enter="emit('click', product)"
  >
    <div class="card-image-wrapper">
      <img
        :src="product.imgSrc"
        :alt="product.title"
        class="card-image"
        loading="lazy"
      />
      <div class="card-overlay">
        <span class="overlay-cta">View Details</span>
      </div>
    </div>

    <div class="card-body">
      <p class="card-title">{{ product.title }}</p>
      <p class="card-price">{{ formatPrice(product.price, product.currency_symbol) }}</p>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  width: 100%;
  cursor: pointer;
  outline: none;
  background: transparent;
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--terra-pale);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(28, 19, 16, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.overlay-cta {
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--ivory);
  border-bottom: 1px solid rgba(250, 246, 239, 0.5);
  padding-bottom: 3px;
  font-weight: 400;
}

.product-card:hover .card-image {
  transform: scale(1.05);
}
.product-card:hover .card-overlay {
  opacity: 1;
}
.product-card:focus-visible .card-overlay {
  opacity: 1;
}

.card-body {
  padding: 14px 4px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  color: var(--ivory);
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.card-price {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 300;
  color: var(--gold);
  letter-spacing: 0.05em;
}
</style>
