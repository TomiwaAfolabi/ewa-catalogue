import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const store = useToastStore()
  return {
    error: (message: string) => store.push(message, 'error'),
    success: (message: string) => store.push(message, 'success'),
    info: (message: string) => store.push(message, 'info'),
  }
}
