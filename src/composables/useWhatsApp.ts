// ─────────────────────────────────────────────
// useWhatsApp — WhatsApp enquiry composable
// Phone number and message template are
// centralised here for easy updates
// ─────────────────────────────────────────────
import { SITE_NAME, getSiteOrigin } from '@/config/site'
import type { CartItem } from '@/types'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '23058533374'

export type CheckoutWhatsAppDelivery = {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode?: string
  country?: string
}

export type CheckoutWhatsAppPayload = {
  items: CartItem[]
  totalNaira: number
  delivery: CheckoutWhatsAppDelivery
  notes?: string
  email?: string
}

function openWhatsAppWithText(text: string) {
  const message = encodeURIComponent(text)
  window.open(
    `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`,
    '_blank',
    'noopener,noreferrer',
  )
}

function formatCheckoutLine(item: CartItem, index: number): string {
  const sym = item.product.currency_symbol || '₦'
  const lineTotal = item.product.price * item.quantity
  const size = item.selectedSize ? ` · Size ${item.selectedSize}` : ''
  return `${index + 1}. ${item.product.title}${size} × ${item.quantity} — ${sym} ${lineTotal.toLocaleString('en-NG')}`
}

function buildCheckoutMessage(payload: CheckoutWhatsAppPayload): string {
  const sym = payload.items[0]?.product.currency_symbol || '₦'
  const lines = payload.items.map((item, i) => formatCheckoutLine(item, i))
  const d = payload.delivery
  const addressParts = [
    d.line1,
    d.line2,
    [d.city, d.state].filter(Boolean).join(', '),
    d.postalCode,
    d.country,
  ].filter((p) => p && String(p).trim())

  const parts = [
    `Hello — I'd like to place an order from ${SITE_NAME}:`,
    '',
    '*Items*',
    ...lines,
    '',
    `*Total:* ${sym} ${payload.totalNaira.toLocaleString('en-NG')}`,
    '(Delivery fee not included — to be confirmed separately.)',
    '',
    '*Delivery details*',
    `Name: ${d.fullName}`,
    `Phone: ${d.phone}`,
  ]

  if (payload.email?.trim()) parts.push(`Email: ${payload.email.trim()}`)
  parts.push(`Address: ${addressParts.join(', ')}`)
  if (payload.notes?.trim()) {
    parts.push('', '*Notes*', payload.notes.trim())
  }

  return parts.join('\n')
}

export function useWhatsApp() {
  function enquireAboutProduct(productTitle: string, productPageUrl?: string) {
    if (!productTitle) return
    const link =
      productPageUrl?.trim() ||
      (typeof window !== 'undefined' ? window.location.href : getSiteOrigin())
    const message = encodeURIComponent(
      `Good day — I am interested in the ${productTitle} on ${SITE_NAME} (${link}).`,
    )
    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function openStoreRequest(customMessage?: string) {
    const text =
      customMessage?.trim() ||
      `Hello — I'd like to make a request while browsing ${SITE_NAME}.`
    openWhatsAppWithText(text)
  }

  function openCheckoutOrder(payload: CheckoutWhatsAppPayload) {
    if (!payload.items.length) return
    openWhatsAppWithText(buildCheckoutMessage(payload))
  }

  return { enquireAboutProduct, openStoreRequest, openCheckoutOrder }
}
