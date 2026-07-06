import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText } from 'lucide-react'
import {
  getAllDaily,
  getAllWeekly,
  getAllMonthly,
  getAllQuarterly,
  getAllAnnual,
  getAllVision,
  getAllAppendix,
} from '@/content/loader'
import { stripMarkdown } from '@/lib/markdown'

// ── Types ────────────────────────────────────────────────────

type SearchItem = {
  title: string
  slug: string
  route: string
  date?: string
  summary?: string
  body?: string
  collection: string
}

type SearchResult = SearchItem & {
  matchedField: 'title' | 'summary' | 'body'
  snippet: string
}

// ── Build index ──────────────────────────────────────────────

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = []

  const collections = [
    { name: '日报', route: 'daily', loader: getAllDaily },
    { name: '周报', route: 'weekly', loader: getAllWeekly },
    { name: '月报', route: 'monthly', loader: getAllMonthly },
    { name: '季报', route: 'quarterly', loader: getAllQuarterly },
    { name: '年报', route: 'annual', loader: getAllAnnual },
    { name: '愿景', route: 'vision', loader: getAllVision },
    { name: '附录', route: 'appendix', loader: getAllAppendix },
  ]

  for (const col of collections) {
    const data = col.loader()
    for (const item of data) {
      items.push({
        title: item.title ?? item.slug,
        slug: item.slug,
        route: `/${col.route}/${item.slug}`,
        date: (item as { date?: string }).date,
        summary: (item as { summary?: string }).summary,
        body: (item as { body?: string }).body,
        collection: col.name,
      })
    }
  }

  return items
}

// ── Search logic ─────────────────────────────────────────────

function searchItems(query: string, items: SearchItem[]): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  for (const item of items) {
    // Title match (highest priority)
    if (item.title.toLowerCase().includes(q)) {
      results.push({ ...item, matchedField: 'title', snippet: highlight(item.title, q) })
      continue
    }
    // Summary match
    if (item.summary) {
      const summary = stripMarkdown(item.summary).toLowerCase()
      if (summary.includes(q)) {
        const idx = summary.indexOf(q)
        const start = Math.max(0, idx - 30)
        const end = Math.min(summary.length, idx + q.length + 60)
        const snippet =
          (start > 0 ? '...' : '') +
          highlight(summary.slice(start, end), q) +
          (end < summary.length ? '...' : '')
        results.push({ ...item, matchedField: 'summary', snippet })
        continue
      }
    }
    // Body match
    if (item.body) {
      const body = stripMarkdown(item.body).toLowerCase()
      if (body.includes(q)) {
        const idx = body.indexOf(q)
        const start = Math.max(0, idx - 40)
        const end = Math.min(body.length, idx + q.length + 80)
        const snippet =
          (start > 0 ? '...' : '') +
          highlight(stripMarkdown(item.body).slice(start, end), q) +
          (end < body.length ? '...' : '')
        results.push({ ...item, matchedField: 'body', snippet })
      }
    }
  }

  return results.slice(0, 20)
}

function highlight(text: string, query: string): string {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-amber-500/30 text-heading rounded px-0.5">$1</mark>')
}

// ── Component ────────────────────────────────────────────────

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const index = useMemo(() => buildIndex(), [])
  const results = useMemo(() => searchItems(query, index), [query, index])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results.length])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      navigate(results[selectedIndex].route)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20"
      onClick={onClose}
    >
      <div
        className="lo-card mx-4 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-dim" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索报告、项目、内容..."
            className="flex-1 bg-transparent text-sm text-body outline-none placeholder:text-placeholder"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-dim transition-colors hover:text-heading"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-6 text-center text-sm text-dim">
              没有找到匹配 "{query}" 的内容。
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.route}-${i}`}
              onClick={() => {
                navigate(r.route)
                onClose()
              }}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                i === selectedIndex ? 'bg-primary-subtle' : 'hover:bg-muted'
              }`}
            >
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-dim" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="truncate text-sm font-medium text-heading"
                    dangerouslySetInnerHTML={{ __html: r.matchedField === 'title' ? r.snippet : r.title }}
                  />
                  <span className="flex-shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-dim">
                    {r.collection}
                  </span>
                </div>
                {r.date && (
                  <span className="font-mono text-[11px] text-dim">{r.date.slice(0, 10)}</span>
                )}
                {r.matchedField !== 'title' && (
                  <p
                    className="mt-1 line-clamp-2 text-xs text-body"
                    dangerouslySetInnerHTML={{ __html: r.snippet }}
                  />
                )}
              </div>
            </button>
          ))}
          {!query && (
            <div className="p-6 text-center text-sm text-dim">
              输入关键词搜索所有报告内容。
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-placeholder">
          <span>↑↓ 导航 · Enter 打开 · Esc 关闭</span>
          <span>Cmd+K</span>
        </div>
      </div>
    </div>
  )
}

// ── Search Button (for NavBar) ───────────────────────────────

export function SearchButton({ onClick }: { onClick: () => void }) {
  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClick()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClick])

  return (
    <button
      onClick={onClick}
      className="lo-icon-btn h-7 w-7 text-dim"
      title="搜索 (Cmd+K)"
    >
      <Search className="h-3.5 w-3.5" />
    </button>
  )
}
