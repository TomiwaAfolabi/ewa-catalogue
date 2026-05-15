// ─────────────────────────────────────────────────────────────────────────────
// Public site identity — https://www.ewaman.com (canonical) · apex redirects in Vercel
// Override with VITE_SITE_URL in production builds / Vercel env.
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical hostname (no protocol). Prefer www; apex → www is handled on Vercel. */
export const SITE_HOST = 'www.ewaman.com'

/** Apex host — used for allowlists / comparisons only. */
export const SITE_APEX_HOST = 'ewaman.com'

/** Display name for titles and Open Graph. */
export const SITE_NAME = 'ẹwà man'

export const SITE_TAGLINE = 'Born of Beauty, Rooted in Heritage'

/** Default meta description for the shop. */
export const SITE_DESCRIPTION =
  'EWA (ẹwà) — Yoruba for beauty. Shop the EWA collection: heritage tailoring, linen, and modern African luxury at ewaman.com.'

/** Contact email shown in UI (optional). */
export const SITE_CONTACT_EMAIL = 'hello@ewaman.com'

const DEFAULT_ORIGIN = `https://${SITE_HOST}`

/**
 * Canonical site origin (no trailing slash).
 * Order: VITE_SITE_URL → current browser origin (dev/preview) → https://www.ewaman.com
 */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  return DEFAULT_ORIGIN
}

/** True when the app is served on ewaman.com or www.ewaman.com. */
export function isProductionSiteHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === SITE_HOST || host === SITE_APEX_HOST
}

/** Absolute URL for a path on this site (path must start with `/` or be route-only). */
export function absoluteSiteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return new URL(normalized, `${getSiteOrigin()}/`).href
}

/** Path-only route URL for Vue Router (e.g. `/catalogue/uuid`). */
export function catalogueProductPath(productId: string): string {
  return `/catalogue/${encodeURIComponent(productId)}`
}

export function catalogueProductUrl(productId: string): string {
  return absoluteSiteUrl(catalogueProductPath(productId))
}

/** Paystack return URL — must match a route allowed in Paystack dashboard. */
export function checkoutReturnUrl(): string {
  return absoluteSiteUrl('/checkout/return')
}
