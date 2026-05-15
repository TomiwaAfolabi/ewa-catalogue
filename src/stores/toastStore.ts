import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastVariant = 'error' | 'success' | 'info'

type ToastItem = { id: number; message: string; variant: ToastVariant }

const DEFAULT_MS = 6000

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])
  let seq = 0
  const timers = new Map<number, ReturnType<typeof setTimeout>>()

  function dismiss(id: number) {
    const t = timers.get(id)
    if (t) clearTimeout(t)
    timers.delete(id)
    items.value = items.value.filter((x) => x.id !== id)
  }

  function push(message: string, variant: ToastVariant = 'error', durationMs = DEFAULT_MS) {
    const id = ++seq
    items.value = [...items.value, { id, message, variant }]
    if (durationMs > 0) {
      timers.set(
        id,
        setTimeout(() => dismiss(id), durationMs),
      )
    }
    return id
  }

  return { items, push, dismiss }
})
