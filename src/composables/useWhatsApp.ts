// ─────────────────────────────────────────────
// useWhatsApp — WhatsApp enquiry composable
// Phone number and message template are
// centralised here for easy updates
// ─────────────────────────────────────────────
import { SITE_NAME, getSiteOrigin } from '@/config/site'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '23058533374'

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
    const message = encodeURIComponent(text)
    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return { enquireAboutProduct, openStoreRequest }
}
