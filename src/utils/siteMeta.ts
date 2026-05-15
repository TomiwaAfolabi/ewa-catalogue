// ─────────────────────────────────────────────────────────────────────────────
// Document head: title helpers, canonical link, Open Graph / Twitter tags
// ─────────────────────────────────────────────────────────────────────────────
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteSiteUrl,
  getSiteOrigin,
} from '@/config/site'

const CANONICAL_ID = 'ewa-canonical'
const OG_IMAGE = '/brand/ewa-logo.png'

function upsertMeta(
  selector: string,
  create: () => HTMLElement,
  apply: (el: HTMLElement) => void,
) {
  let el = document.head.querySelector(selector) as HTMLElement | null
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  apply(el)
}

function upsertLinkRel(rel: string, href: string) {
  const selector = `link[rel="${rel}"]#${CANONICAL_ID}`
  upsertMeta(
    selector,
    () => {
      const link = document.createElement('link')
      link.rel = rel
      link.id = CANONICAL_ID
      return link
    },
    (el) => {
      ;(el as HTMLLinkElement).href = href
    },
  )
}

function upsertMetaProperty(property: string, content: string) {
  const selector = `meta[property="${property}"]`
  upsertMeta(
    selector,
    () => {
      const meta = document.createElement('meta')
      meta.setAttribute('property', property)
      return meta
    },
    (el) => {
      el.setAttribute('content', content)
    },
  )
}

function upsertMetaName(name: string, content: string) {
  const selector = `meta[name="${name}"]`
  upsertMeta(
    selector,
    () => {
      const meta = document.createElement('meta')
      meta.setAttribute('name', name)
      return meta
    },
    (el) => {
      el.setAttribute('content', content)
    },
  )
}

export type SiteMetaOptions = {
  title: string
  description?: string
  path?: string
  /** Product / page image path on this origin (defaults to brand logo). */
  imagePath?: string
  noIndex?: boolean
}

/** Sync `<head>` after navigation (canonical, OG, Twitter). */
export function applySiteMeta(options: SiteMetaOptions) {
  const origin = getSiteOrigin()
  const path = options.path ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const url = absoluteSiteUrl(path)
  const description = options.description?.trim() || SITE_DESCRIPTION
  const image = absoluteSiteUrl(options.imagePath ?? OG_IMAGE)

  document.title = options.title

  upsertLinkRel('canonical', url)
  upsertMetaName('description', description)

  upsertMetaProperty('og:site_name', SITE_NAME)
  upsertMetaProperty('og:title', options.title)
  upsertMetaProperty('og:description', description)
  upsertMetaProperty('og:url', url)
  upsertMetaProperty('og:type', 'website')
  upsertMetaProperty('og:image', image)
  upsertMetaProperty('og:locale', 'en_NG')

  upsertMetaName('twitter:card', 'summary_large_image')
  upsertMetaName('twitter:title', options.title)
  upsertMetaName('twitter:description', description)
  upsertMetaName('twitter:image', image)

  upsertMetaName('robots', options.noIndex ? 'noindex, nofollow' : 'index, follow')
  upsertMetaName('application-name', SITE_NAME)
}
