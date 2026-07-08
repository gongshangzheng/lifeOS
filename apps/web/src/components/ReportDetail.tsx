import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Sparkles } from 'lucide-react'
import { stripMarkdown } from '@/lib/markdown'
import { MarkdownView } from './MarkdownView'
import { useEffect, useState } from 'react'

export type ReportDetailItem = {
  title: string
  slug: string
  date?: string
  summary?: string
  body: string
}

type ReportDetailProps = {
  title?: string
  item: ReportDetailItem | undefined
  backTo: string
  backLabel: string
  notFoundTitle?: string
  /** If set, fetch events.json and display events for this date */
  showEventsForDate?: string
  /** If set, fetch first-times.json and display first-time experiences for this date */
  showFirstTimesForDate?: string
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

function formatDate(iso?: string): string | null {
  if (!iso) return null
  return iso.slice(0, 10)
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

export function ReportDetail({
  title,
  item,
  backTo,
  backLabel,
  notFoundTitle = '未找到',
  showEventsForDate,
  showFirstTimesForDate,
}: ReportDetailProps) {
  const { slug = '' } = useParams<{ slug: string }>()

  if (!item) {
    return (
      <section className="space-y-3">
        <h1 className="lo-section-title">{notFoundTitle}</h1>
        <p className="text-body">
          没有找到 slug 为 <code className="lo-code">{slug}</code> 的报告。
        </p>
        <Link to={backTo} className="lo-link inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回 {backLabel}
        </Link>
      </section>
    )
  }

  const date = formatDate(item.date)
  const summary = item.summary ? stripMarkdown(item.summary) : ''

  return (
    <article className="space-y-5">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <header className="lo-divider space-y-2 border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          {title ?? item.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-dim">
          {date && <span className="font-mono">{date}</span>}
          <span className="font-mono text-placeholder">/{item.slug}</span>
        </div>
        {summary && <p className="text-sm text-body">{summary}</p>}
      </header>

      {showEventsForDate && <EventsForDate date={showEventsForDate} />}

      {showFirstTimesForDate && <FirstTimesForDate date={showFirstTimesForDate} />}

      <MarkdownView body={item.body} />
    </article>
  )
}
