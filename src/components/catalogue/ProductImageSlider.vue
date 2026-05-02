<script setup lang="ts">
import { computed } from 'vue'
import { useImageSlider } from '@/composables/useImageSlider'

const props = defineProps<{ images: string[]; title: string }>()

const { currentIndex, currentImage, total, next, prev, goTo } =
  useImageSlider(props.images)
</script>

<template>
  <div class="slider" role="region" :aria-label="`${title} images`">
    <!-- Main image -->
    <div class="slider-main">
      <Transition name="slide" mode="out-in">
        <img
          :key="currentIndex"
          :src="currentImage"
          :alt="`${title} — image ${currentIndex + 1}`"
          class="slider-image"
          loading="lazy"
        />
      </Transition>

      <!-- Prev/Next -->
      <button
        v-if="total > 1"
        class="slider-btn slider-btn--prev"
        @click="prev"
        aria-label="Previous image"
      >&#8249;</button>

      <button
        v-if="total > 1"
        class="slider-btn slider-btn--next"
        @click="next"
        aria-label="Next image"
      >&#8250;</button>

      <!-- Counter -->
      <div class="slider-counter" v-if="total > 1">
        {{ currentIndex + 1 }} / {{ total }}
      </div>
    </div>

    <!-- Thumbnails -->
    <div class="slider-thumbs" v-if="total > 1" role="tablist">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="thumb"
        :class="{ 'thumb--active': i === currentIndex }"
        role="tab"
        :aria-selected="i === currentIndex"
        :aria-label="`View image ${i + 1}`"
        @click="goTo(i)"
      >
        <img :src="img" :alt="`Thumbnail ${i + 1}`" class="thumb-img" loading="lazy" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.slider-main {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--terra-pale);
}

.slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Buttons ──────────────────── */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(28, 19, 16, 0.55);
  border: 1px solid rgba(201, 168, 76, 0.2);
  color: var(--ivory);
  font-size: 28px;
  line-height: 1;
  padding: 8px 14px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
  z-index: 2;
}
.slider-btn:hover { background: rgba(181, 82, 42, 0.7); }
.slider-btn--prev { left: 12px; }
.slider-btn--next { right: 12px; }

/* ── Counter ──────────────────── */
.slider-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--ivory);
  background: rgba(28, 19, 16, 0.6);
  padding: 4px 10px;
  border-radius: 99px;
}

/* ── Thumbnails ───────────────── */
.slider-thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.thumb {
  flex-shrink: 0;
  width: 64px;
  height: 80px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color var(--transition-base);
  padding: 0;
  background: none;
}

.thumb--active { border-color: var(--terra); }
.thumb:hover   { border-color: var(--terra-light); }

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Transition ───────────────── */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.slide-enter-from { opacity: 0; transform: translateX(12px); }
.slide-leave-to   { opacity: 0; transform: translateX(-12px); }
</style>
