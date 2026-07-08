import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { MarkdownView } from './MarkdownView'
import { RelatedReports } from './RelatedReports'
import { extractToc } from '@/lib/utils'
import { stripMarkdown } from '@/lib/markdown'
import { useEffect, useState, type ComponentType } from 'react'
import { CalendarDays, Sparkles } from 'lucide-react'

export type ReportTab = {
  key: string
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
}

export type ReportListItem = {
  slug: string
  title: string
  date?: string
  summary?: string
  category?: string
}

export type ReportDetailItem = {
  title: string
  slug: string
  date?: string
  summary?: string
  body: string
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  description?: string
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  study: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  health: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500' },
  work: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  social: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', dot: 'bg-pink-500' },
  life: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-500' },
  other: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', dot: 'bg-gray-500' },
}

function formatDate(iso?: string): string {
  return iso?.slice(0, 10) ?? ''
}

function EventsForDate({ date }: { date: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/lifeOS/events.json')
      .then((res) => res.json())
      .then((data) => {
        setEvents((data.events ?? []).filter((e: CalendarEvent) => e.date === date))
        setLoading(false)
      })
      .catch(() => {
        setEvents([])
        setLoading(false)
      })
  }, [date])

  if (loading) return null
  if (events.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-dim">
        <CalendarDays className="h-3.5 w-3.5" />
        当日事件
      </div>
      <div className="mt-3 space-y-2">
        {events.map((e) => {
          const colors = CATEGORY_COLORS[e.category ?? 'other'] ?? CATEGORY_COLORS.other
          return (
            <div
              key={e.id}
              className={`flex items-center gap-3 rounded-md border ${colors.border} ${colors.bg} px-3 py-2`}
            >
              <div className={`h-2 w-2 flex-shrink-0 rounded-full ${colors.dot}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${colors.text}`}>{e.title}</div>
                <div className="text-xs text-dim">
                  {e.startTime ?? '—'} – {e.endTime ?? '—'}
                  {e.location ? ` · ${e.location}` : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FirstTimesForDate({ date }: { date: string }) {
  const [items, setItems] = useState<{ title: string; note?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/lifeOS/first-times.json')
      .then((res) => res.json())
      .then((data) => {
        setItems((data.firstTimes ?? []).filter((e: { date: string }) => e.date === date))
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
      })
  }, [date])

  if (loading || items.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-500/80">
        <Sparkles className="h-3.5 w-3.5" />
        初体验
      </div>
      <div className="mt-3 space-y-1.5">
        {items.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-amber-500/60">✦</span>
            <span className="text-body">
              {e.title}
              {e.note ? <span className="ml-1.5 text-xs text-dim">— {e.note}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

type ReportLayoutProps = {
  type: string
  label: string
  description: string
  basePath: string
  empty: string
  tabs: ReportTab[]
  items: ReportListItem[]
  detail?: ReportDetailItem
  showEventsForDate?: boolean
  showFirstTimesForDate?: boolean
  relatedType?: string
}

/** Wiki-style three-column report layout */
export function ReportLayout({
  type,
  label,
  description,
  basePath,
  empty,
  tabs,
  items,
  detail,
  showEventsForDate,
  showFirstTimesForDate,
  relatedType,
}: ReportLayoutProps) {
  const navigate = useNavigate()
  const { slug: currentSlug } = useParams<{ slug: string }>()

  // If no detail, redirect to first item (but prevent redirect loop)
  if (!detail) {
    if (items.length > 0 && items[0].slug !== currentSlug) {
      return <Navigate to={`${basePath}/${items[0].slug}`} replace />
    }
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <h1 className="lo-section-title">{label}</h1>
          <p className="text-xs text-dim">{description}</p>
        </header>
        <p className="py-8 text-center text-sm text-dim">{empty}</p>
      </section>
    )
  }

  // Find prev/next (items are sorted by date desc, so prev = newer, next = older)
  const currentIdx = items.findIndex((r) => r.slug === detail.slug)
  const prevItem = currentIdx > 0 ? items[currentIdx - 1] : null
  const nextItem = currentIdx < items.length - 1 ? items[currentIdx + 1] : null

  // Extract TOC from article body
  const tocItems = extractToc(detail.body)

  // Article metadata
  const date = formatDate(detail.date)
  const summary = detail.summary ? stripMarkdown(detail.summary) : ''
  const eventsDate = (showEventsForDate || showFirstTimesForDate) && detail.date ? detail.date.slice(0, 10) : undefined

  return (
    <div className="flex gap-6">
      {/* ── Left sidebar: report type tabs + article list ── */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          {/* Layer 1: report type tabs */}
          <div className="report-type-tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                className={`report-type-tab ${tab.key === type ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {/* Layer 2: article list */}
          <div className="mb-3 flex items-center gap-1.5 px-2 text-xs font-semibold text-heading">
            <FileText className="h-3.5 w-3.5" />
            {label}
          </div>
          <nav>
            {items.map((item) => (
              <Link
                key={item.slug}
                to={`${basePath}/${item.slug}`}
                className={`guide-sidebar-link ${item.slug === detail?.slug ? 'active' : ''}`}
              >
                <div className="truncate">{item.title}</div>
                {item.date && (
                  <div className="mt-0.5 font-mono text-[10px] text-placeholder">
                    {formatDate(item.date)}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Center: article content ── */}
      <article className="min-w-0 flex-1">
        {/* Mobile article selector */}
        <div className="mb-4 lg:hidden">
          <label className="mb-1 block text-xs font-medium text-dim">选择{label}</label>
          <select
            value={detail.slug}
            onChange={(e) => {
              navigate(`${basePath}/${e.target.value}`)
            }}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-heading"
          >
            {items.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1 text-xs text-dim">
          <Link to="/" className="hover:text-heading">
            lifeOS
          </Link>
          <span>/</span>
          <Link to={basePath} className="hover:text-heading">
            {label}
          </Link>
        </div>

        {/* Article header */}
        <header className="mb-6 border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-heading">{detail.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-dim">
            {date && <span className="font-mono">{date}</span>}
            <span className="font-mono text-placeholder">/{detail.slug}</span>
          </div>
          {summary && <p className="mt-2 text-sm text-dim">{summary}</p>}
        </header>

        {/* Events and First Times widgets */}
        {eventsDate && <div className="mb-6 space-y-4"><EventsForDate date={eventsDate} /><FirstTimesForDate date={eventsDate} /></div>}

        {/* Article body */}
        <div className="lo-card p-6">
          <MarkdownView body={detail.body} />
        </div>

        {/* Related reports */}
        {detail.date && relatedType && (
          <RelatedReports type={relatedType as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'vision' | 'appendix'} slug={detail.slug} date={detail.date} />
        )}

        {/* Prev / Next navigation */}
        <div className="mt-6 flex items-stretch gap-3">
          {prevItem ? (
            <Link
              to={`${basePath}/${prevItem.slug}`}
              className="lo-card group flex flex-1 items-center gap-3 p-4 transition-colors hover:border-primary/40"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 text-dim transition-colors group-hover:text-primary" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-placeholder">较新</div>
                <div className="truncate text-sm font-medium text-heading">
                  {prevItem.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextItem ? (
            <Link
              to={`${basePath}/${nextItem.slug}`}
              className="lo-card group flex flex-1 items-center justify-end gap-3 p-4 text-right transition-colors hover:border-primary/40"
            >
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-placeholder">较旧</div>
                <div className="truncate text-sm font-medium text-heading">
                  {nextItem.title}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-dim transition-colors group-hover:text-primary" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </article>

      {/* ── Right sidebar: TOC ── */}
      {tocItems.length > 0 && (
        <aside className="hidden w-48 shrink-0 xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="mb-2 px-2 text-xs font-semibold text-heading">
              目录
            </div>
            <nav>
              {tocItems.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.slug}`}
                  className={`guide-toc-link ${item.level === 3 ? 'level-3' : ''}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  )
}
