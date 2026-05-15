// ─────────────────────────────────────────────────────────────────────────────
// Saved shipping addresses (per user, localStorage) + apply to checkout fields
// ─────────────────────────────────────────────────────────────────────────────
import { ref, watch, computed, type Ref } from 'vue'
import type { CheckoutShippingSnapshot } from '@/composables/useCheckoutDelivery'

export type SavedShippingAddress = CheckoutShippingSnapshot & {
  id: string
  savedAt: string
}

const MAX_ADDRESSES = 20

function snapshotsEqual(a: CheckoutShippingSnapshot, b: CheckoutShippingSnapshot): boolean {
  return (
    a.fullName.trim() === b.fullName.trim() &&
    a.phone.trim() === b.phone.trim() &&
    a.address.line1.trim() === b.address.line1.trim() &&
    (a.address.line2 ?? '').trim() === (b.address.line2 ?? '').trim() &&
    a.address.city.trim() === b.address.city.trim() &&
    (a.address.state ?? '').trim() === (b.address.state ?? '').trim() &&
    (a.address.postalCode ?? '').trim() === (b.address.postalCode ?? '').trim() &&
    a.address.country.trim() === b.address.country.trim()
  )
}

function isSavedAddr(x: unknown): x is SavedShippingAddress {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.savedAt === 'string' &&
    typeof o.fullName === 'string' &&
    typeof o.phone === 'string' &&
    o.address != null &&
    typeof o.address === 'object' &&
    typeof (o.address as Record<string, unknown>).line1 === 'string' &&
    typeof (o.address as Record<string, unknown>).city === 'string' &&
    typeof (o.address as Record<string, unknown>).country === 'string'
  )
}

/** Copy a saved snapshot onto the reactive checkout delivery object. */
export function applyShippingSnapshotToDelivery(
  delivery: {
    fullName: string
    phone: string
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
    country: string
  },
  s: CheckoutShippingSnapshot,
) {
  delivery.fullName = s.fullName
  delivery.phone = s.phone
  delivery.line1 = s.address.line1
  delivery.line2 = s.address.line2 ?? ''
  delivery.city = s.address.city
  delivery.state = s.address.state ?? ''
  delivery.postalCode = s.address.postalCode ?? ''
  delivery.country = s.address.country
}

export function useAddressBook(userId: Ref<string | undefined>) {
  const list = ref<SavedShippingAddress[]>([])
  /** Use in templates — unwraps correctly (avoids nested Ref in parent objects). */
  const addresses = computed(() => list.value)

  function key(): string {
    const id = userId.value
    return id ? `ewa_address_book_v1_${id}` : 'ewa_address_book_v1_guest'
  }

  function load() {
    const k = key()
    try {
      const raw = localStorage.getItem(k)
      if (!raw) {
        list.value = []
        return
      }
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) {
        list.value = []
        return
      }
      list.value = parsed.filter(isSavedAddr)
    } catch {
      list.value = []
    }
  }

  function persist() {
    localStorage.setItem(key(), JSON.stringify(list.value))
  }

  function addFromSnapshot(s: CheckoutShippingSnapshot): boolean {
    if (!s.fullName?.trim() || !s.phone?.trim() || !s.address?.line1?.trim() || !s.address?.city?.trim()) {
      return false
    }
    if (list.value.some((a) => snapshotsEqual(a, s))) return true
    const row: SavedShippingAddress = {
      ...s,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    }
    list.value = [row, ...list.value].slice(0, MAX_ADDRESSES)
    persist()
    return true
  }

  function remove(id: string) {
    list.value = list.value.filter((a) => a.id !== id)
    persist()
  }

  watch(userId, load, { immediate: true })

  return { addresses, addFromSnapshot, remove, reload: load }
}
