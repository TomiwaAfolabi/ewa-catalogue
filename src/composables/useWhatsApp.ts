// ─────────────────────────────────────────────
// useWhatsApp — WhatsApp enquiry composable
// Phone number and message template are
// centralised here for easy updates
// ─────────────────────────────────────────────
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '23058533374'

export function useWhatsApp() {
  function enquireAboutProduct(productTitle: string) {
    if (!productTitle) return
    const message = encodeURIComponent(
      `Good Day, I am interested in purchasing the ${productTitle} listed on your website.`
    )
    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return { enquireAboutProduct }
}
