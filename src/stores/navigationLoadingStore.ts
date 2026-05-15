import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Full-route transition overlay (lazy chunks + guard resolution).
 * Started from `router.beforeEach` when leaving a resolved route; cleared in `afterEach`.
 */
export const useNavigationLoadingStore = defineStore('navigationLoading', () => {
  const active = ref(false)

  function start() {
    active.value = true
  }

  function stop() {
    active.value = false
  }

  return { active, start, stop }
})
