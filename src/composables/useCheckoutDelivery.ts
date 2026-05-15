// ─────────────────────────────────────────────────────────────────────────────
// Checkout delivery + contact fields with per-user localStorage recall
// ─────────────────────────────────────────────────────────────────────────────
import { reactive, ref, watch, type Ref } from 'vue'
import type { AuthUser } from '@/types'

function storageKey(userId: string | undefined) {
  return userId ? `ewa_checkout_delivery_v1_${userId}` : 'ewa_checkout_delivery_v1_guest'
}

export type CheckoutShippingSnapshot = {
  fullName: string
  phone: string
  address: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode?: string
    country: string
  }
  source: 'checkout'
}

export function useCheckoutDelivery(
  userId: Ref<string | undefined>,
  authUser: Ref<AuthUser | null>,
) {
  const fullName = ref('')
  const phone = ref('')
  const line1 = ref('')
  const line2 = ref('')
  const city = ref('')
  const state = ref('')
  const postalCode = ref('')
  const country = ref('NG')
  const rememberOnDevice = ref(false)

  function snapshot(): CheckoutShippingSnapshot {
    return {
      fullName: fullName.value.trim(),
      phone: phone.value.trim(),
      address: {
        line1: line1.value.trim(),
        ...(line2.value.trim() ? { line2: line2.value.trim() } : {}),
        city: city.value.trim(),
        ...(state.value.trim() ? { state: state.value.trim() } : {}),
        ...(postalCode.value.trim() ? { postalCode: postalCode.value.trim() } : {}),
        country: country.value.trim() || 'NG',
      },
      source: 'checkout',
    }
  }

  function stripUnsafe(s: string) {
    return s.replace(/[<>]/g, '')
  }

  function persist() {
    if (!rememberOnDevice.value) return
    localStorage.setItem(
      storageKey(userId.value),
      JSON.stringify({
        fullName: stripUnsafe(fullName.value),
        phone: stripUnsafe(phone.value),
        line1: stripUnsafe(line1.value),
        line2: stripUnsafe(line2.value),
        city: stripUnsafe(city.value),
        state: stripUnsafe(state.value),
        postalCode: stripUnsafe(postalCode.value),
        country: stripUnsafe(country.value),
      }),
    )
  }

  function clearPersisted() {
    localStorage.removeItem(storageKey(userId.value))
  }

  function loadPersisted(): boolean {
    const raw = localStorage.getItem(storageKey(userId.value))
    if (!raw) return false
    try {
      const o = JSON.parse(raw) as Record<string, unknown>
      const str = (v: unknown) => (typeof v === 'string' ? v : v != null ? String(v) : '')
      fullName.value = str(o.fullName)
      phone.value = str(o.phone)
      line1.value = str(o.line1)
      line2.value = str(o.line2)
      city.value = str(o.city)
      state.value = str(o.state)
      postalCode.value = str(o.postalCode)
      country.value = str(o.country) || 'NG'
      rememberOnDevice.value = true
      return true
    } catch {
      return false
    }
  }

  function applyAccountDefaults() {
    const u = authUser.value
    if (!u) return
    if (!fullName.value.trim()) {
      const n = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
      if (n) fullName.value = n
    }
    if (!phone.value.trim() && u.phone?.trim()) {
      phone.value = u.phone.trim()
    }
  }

  function resetFields() {
    fullName.value = ''
    phone.value = ''
    line1.value = ''
    line2.value = ''
    city.value = ''
    state.value = ''
    postalCode.value = ''
    country.value = 'NG'
    rememberOnDevice.value = false
  }

  watch(
    userId,
    (id, prev) => {
      if (prev !== undefined && prev !== id) resetFields()
      const hadStored = loadPersisted()
      if (!hadStored) {
        rememberOnDevice.value = false
        applyAccountDefaults()
      }
    },
    { immediate: true },
  )

  watch(rememberOnDevice, (on) => {
    if (!on) clearPersisted()
    else persist()
  })

  watch(
    [fullName, phone, line1, line2, city, state, postalCode, country],
    () => {
      if (rememberOnDevice.value) persist()
    },
    { deep: true },
  )

  return reactive({
    fullName,
    phone,
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
    rememberOnDevice,
    snapshot,
    clearPersisted,
  })
}
