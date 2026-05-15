<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useImageSlider } from '@/composables/useImageSlider'

const props = defineProps<{ images: string[]; title: string }>()

const { currentIndex, currentImage, total, next, prev, goTo } =
  useImageSlider(props.images)

const lightboxOpen = ref(false)

function openLightbox() {
  lightboxOpen.value = true
}

function openLightboxAt(index: number) {
  goTo(index)
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function onLightboxKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeLightbox()
}

watch(lightboxOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onLightboxKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onLightboxKeydown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onLightboxKeydown)
})
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

      <button
        type="button"
        class="slider-zoom-hit"
        aria-label="View larger image"
        @click="openLightbox"
      />

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
        :aria-label="`View image ${i + 1} larger`"
        @click="openLightboxAt(i)"
      >
        <img :src="img" :alt="`Thumbnail ${i + 1}`" class="thumb-img" loading="lazy" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="lightbox-root"
          role="dialog"
          aria-modal="true"
          :aria-label="`Enlarged: ${title}`"
        >
          <button
            type="button"
            class="lightbox-backdrop"
            aria-label="Close enlarged view"
            @click="closeLightbox"
          />
          <div class="lightbox-shell">
            <button
              type="button"
              class="lightbox-close"
              aria-label="Close enlarged view"
              @click="closeLightbox"
            >
              ×
            </button>

            <div class="lightbox-stage">
              <img
                :key="currentIndex"
                :src="currentImage"
                :alt="`${title} — image ${currentIndex + 1}, enlarged`"
                class="lightbox-img"
                loading="eager"
                decoding="async"
              >

              <button
                v-if="total > 1"
                type="button"
                class="lightbox-nav lightbox-nav--prev"
                aria-label="Previous image"
                @click="prev"
              >&#8249;</button>
              <button
                v-if="total > 1"
                type="button"
                class="lightbox-nav lightbox-nav--next"
                aria-label="Next image"
                @click="next"
              >&#8250;</button>
            </div>

            <p v-if="total > 1" class="lightbox-counter">
              {{ currentIndex + 1 }} / {{ total }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.slider-main {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
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

.slider-zoom-hit {
  position: absolute;
  inset: 0;
  z-index: 1;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: inherit;
  background: transparent;
  cursor: zoom-in;
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
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.thumb {
  flex-shrink: 0;
  width: 64px;
  height: 80px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 2px solid transparent;
  cursor: zoom-in;
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

/* ── Lightbox ─────────────────── */
.lightbox-root {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.lightbox-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  margin: 0;
  padding: 0;
  background: rgba(12, 8, 6, 0.92);
  cursor: pointer;
}

.lightbox-shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: min(96vw, 1200px);
  max-height: 100%;
  pointer-events: none;
}

.lightbox-shell > * {
  pointer-events: auto;
}

.lightbox-close {
  position: absolute;
  top: -48px;
  right: 0;
  z-index: 3;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: var(--radius-sm);
  background: rgba(28, 19, 16, 0.85);
  color: var(--ivory);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: background var(--transition-base), border-color var(--transition-base);
}
.lightbox-close:hover {
  background: rgba(181, 82, 42, 0.75);
  border-color: rgba(201, 168, 76, 0.55);
}

.lightbox-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: min(96vw, 1200px);
  max-height: calc(100vh - 120px);
}

.lightbox-img {
  max-width: 100%;
  max-height: calc(100vh - 120px);
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: var(--radius-sm);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(28, 19, 16, 0.65);
  border: 1px solid rgba(201, 168, 76, 0.25);
  color: var(--ivory);
  font-size: 32px;
  line-height: 1;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
  z-index: 2;
}
.lightbox-nav:hover { background: rgba(181, 82, 42, 0.75); }
.lightbox-nav--prev { left: 8px; }
.lightbox-nav--next { right: 8px; }

.lightbox-counter {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--muted);
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.28s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
