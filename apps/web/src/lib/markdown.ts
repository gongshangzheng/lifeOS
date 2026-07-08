// Collection directory → public route name.
// content lives under numbered folders (1-vision, 6-daily, …) but the SPA exposes
// clean unprefixed routes (/vision, /daily, …).
const COLLECTION_DIR_TO_ROUTE: Record<string, string> = {
  '1-vision': 'vision',
  '2-annual': 'annual',
  '3-quarterly': 'quarterly',
  '4-monthly': 'monthly',
  '5-weekly': 'weekly',
  '6-daily': 'daily',
  appendix: 'appendix',
}

// Static import — .velite is plain JS data, no circular dep risk.
import * as VeliteData from '@/content/.velite'

const ALL_COLLECTIONS: ReadonlyArray<{ route: string; items: ReadonlyArray<{ slug: string }> }> =
  (['vision', 'annual', 'quarterly', 'monthly', 'weekly', 'daily', 'appendix'] as const).map(
    (route) => {
      const items = (VeliteData as Record<string, unknown>)[route]
      return {
        route,
        items: Array.isArray(items)
          ? (items as ReadonlyArray<{ slug: string }>)
          : [],
      }
    },
  )

/**
 * Rewrite an internal markdown link to a real SPA route.
 *
 * Handles the patterns Velite content uses today:
 *   "../4-monthly/2026-06.md"           -> "/monthly/2026-06"
 *   "./three-year-career-2026-2028.md"  -> looks up the slug across collections
 *   "2026-06-W24"                       -> same lookup
 *
 * Returns `null` if the href does not look like an internal link — caller can
 * then treat it as external.
 */
export function internalLinkHref(href: string): string | null {
  if (!href) return null

  // absolute URLs are never internal
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null

  // strip the .md extension
  const path = href.replace(/\.md$/i, '')
  // collapse any leading ./ or ../ segments
  const cleaned = path.replace(/^(\.\.?\/)+/, '')

  // case 1: "<dir>/<slug>" — e.g. "4-monthly/2026-06" or "appendix/life/training-notes"
  const dirSlug = cleaned.match(/^([0-9]+-)?([a-z]+)\/(.+)$/i)
  if (dirSlug) {
    const dirKey = `${dirSlug[1] ?? ''}${dirSlug[2]}`
    const route = COLLECTION_DIR_TO_ROUTE[dirKey]
    if (route) {
      // appendix files live in subdirectories (life/, career/, …)
      // but velite slug is just the filename. Extract the last segment.
      const slug = dirSlug[3].includes('/') ? dirSlug[3].split('/').pop()! : dirSlug[3]
      return `/report/${route}/${slug}`
    }
  }

  // case 2: bare slug — look it up across all collections
  const route = findRouteForSlug(cleaned)
  if (route) {
    return `/report/${route}/${cleaned}`
  }

  return null
}

function findRouteForSlug(slug: string): string | null {
  for (const { route, items } of ALL_COLLECTIONS) {
    if (items.some((it) => it.slug === slug)) {
      return route
    }
  }
  return null
}

/**
 * Strip the most common markdown syntax to get a plain-text preview.
 * Used for list cards where rendering full markdown is overkill.
 */
export function stripMarkdown(input: string): string {
  return input
    // [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // ![alt](url) -> alt
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // **bold** / __bold__
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    // *em* / _em_
    .replace(/(\*|_)(.+?)\1/g, '$2')
    // `code`
    .replace(/`([^`]+)`/g, '$1')
    // leading blockquote markers
    .replace(/^>\s*/gm, '')
    // collapse extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}
