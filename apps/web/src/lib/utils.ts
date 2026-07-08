import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ── TOC extraction ───────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
}

export type TocItem = { level: number; text: string; slug: string }

/** Parse markdown body to extract h2/h3 headings for TOC. */
export function extractToc(body: string): TocItem[] {
  const lines = body.split('\n')
  const items: TocItem[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = /^(#{2,3})\s+(.+)$/.exec(line)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      items.push({ level, text, slug: slugify(text) })
    }
  }
  return items
}
