// ─────────────────────────────────────────────────────────────────────────────
// Engagement prompt: once per tab visit, ~1 minute after the tab is active.
// Resets when the user leaves the tab or closes it, then returns.
// ─────────────────────────────────────────────────────────────────────────────
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import api from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { useWhatsApp } from '@/composables/useWhatsApp'
import type { EngagementPrompt } from '@/types'

/** Wait before checking — avoids prompting the moment someone lands. */
const PROMPT_DELAY_MS = 60 * 1000

export function useEngagementPrompt() {
  const auth = useAuthStore()
  const { isLoggedIn } = storeToRefs(auth)
  const { openStoreRequest } = useWhatsApp()

  const prompt = ref<EngagementPrompt | null>(null)
  const dismissing = ref(false)

  let delayTimer: ReturnType<typeof setTimeout> | null = null
  /** True after we show (or attempted show for this cycle) — no repeat until tab hidden. */
  let checkedThisTabVisit = false

  function clearDelayTimer() {
    if (delayTimer !== null) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
  }

  function resetTabVisit() {
    clearDelayTimer()
    checkedThisTabVisit = false
    prompt.value = null
  }

  function schedulePromptCheck() {
    if (!isLoggedIn.value || checkedThisTabVisit) return
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return

    clearDelayTimer()
    delayTimer = setTimeout(() => {
      delayTimer = null
      void fetchAndMaybeShow()
    }, PROMPT_DELAY_MS)
  }

  async function fetchAndMaybeShow() {
    if (!isLoggedIn.value || checkedThisTabVisit) return
    if (document.visibilityState !== 'visible') return

    checkedThisTabVisit = true

    try {
      const res = await api.engagement.getPrompt()
      if (document.visibilityState !== 'visible') return
      prompt.value = res.data ?? null
    } catch {
      /* Non-blocking — catalogue should keep working if engagement is down. */
    }
  }

  async function dismiss() {
    const id = prompt.value?.id
    if (!id || dismissing.value) {
      prompt.value = null
      return
    }
    dismissing.value = true
    try {
      await api.engagement.dismissPrompt(id)
    } catch {
      /* Close locally even if dismiss fails (e.g. offline). */
    } finally {
      prompt.value = null
      dismissing.value = false
    }
  }

  function makeRequest() {
    openStoreRequest(
      'Hello — I’m browsing the store and would like to make a request. Could you help?',
    )
    void dismiss()
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      resetTabVisit()
      return
    }
    if (document.visibilityState === 'visible' && isLoggedIn.value) {
      schedulePromptCheck()
    }
  }

  watch(
    isLoggedIn,
    (loggedIn) => {
      if (loggedIn) {
        schedulePromptCheck()
      } else {
        resetTabVisit()
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    resetTabVisit()
  })

  return {
    prompt,
    dismissing,
    dismiss,
    makeRequest,
  }
}
