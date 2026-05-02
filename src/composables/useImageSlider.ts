// ─────────────────────────────────────────────
// useImageSlider — replaces the raw DOM slideshow
// in CataloguePage.vue with reactive Vue state
// ─────────────────────────────────────────────
import { ref, computed } from 'vue'

export function useImageSlider(images: string[]) {
  const currentIndex = ref(0)

  const currentImage = computed(() => images[currentIndex.value])
  const total = computed(() => images.length)
  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value === images.length - 1)

  function next() {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }

  function prev() {
    currentIndex.value =
      (currentIndex.value - 1 + images.length) % images.length
  }

  function goTo(index: number) {
    if (index >= 0 && index < images.length) {
      currentIndex.value = index
    }
  }

  return { currentIndex, currentImage, total, isFirst, isLast, next, prev, goTo }
}
