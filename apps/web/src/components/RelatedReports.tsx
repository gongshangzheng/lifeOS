import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUp, Calendar } from 'lucide-react'
import {
  getAllDaily,
  getAllWeekly,
  getAllMonthly,
  getAllQuarterly,
  getAllAnnual,
} from '@/content/loader'

// ── Helpers ──────────────────────────────────────────────────

function getIsoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function formatDate(iso?: string): string {
  return iso?.slice(0, 10) ?? ''
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ── Types ────────────────────────────────────────────────────

type RelatedReportsProps = {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'vision' | 'appendix'
  slug: string
  date?: string
}

// ── Component ────────────────────────────────────────────────

export function RelatedReports({ type, date }: { type: RelatedReportsProps['type']; slug: string; date?: string }) {
  if (!date) return null

  const links: Array<{
    to: string
    label: string
    icon: typeof ArrowLeft
    hint?: string
  }> = []

  const d = new Date(date)
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const weekKey = getIsoWeekKey(d)
  const quarter = `Q${Math.ceil((d.getMonth() + 1) / 3)}`
  const yearKey = String(d.getFullYear())

  if (type === 'daily') {
    // Previous / next daily
    const prevSlug = addDays(date, -1)
    const nextSlug = addDays(date, 1)
    const allDailies = getAllDaily()
    const prevDaily = allDailies.find((x) => x.slug === prevSlug)
    const nextDaily = allDailies.find((x) => x.slug === nextSlug)
    if (prevDaily) links.push({ to: `/daily/${prevSlug}`, label: prevDaily.title, icon: ArrowLeft, hint: '前一天' })
    if (nextDaily) links.push({ to: `/daily/${nextSlug}`, label: nextDaily.title, icon: ArrowRight, hint: '后一天' })

    // Parent weekly
    const weeklies = getAllWeekly()
    const parentWeek = weeklies.find((w) => w.slug.includes(weekKey))
    if (parentWeek) links.push({ to: `/weekly/${parentWeek.slug}`, label: parentWeek.title, icon: ArrowUp, hint: '所属周报' })

    // Parent monthly
    const monthlys = getAllMonthly()
    const parentMonth = monthlys.find((m) => m.slug === ym)
    if (parentMonth) links.push({ to: `/monthly/${parentMonth.slug}`, label: parentMonth.title, icon: ArrowUp, hint: '所属月报' })
  }

  if (type === 'weekly') {
    // Dailies in this week
    const allDailies = getAllDaily()
    const weekDailies = allDailies.filter((x) => x.date && getIsoWeekKey(new Date(x.date)) === weekKey)
    for (const wd of weekDailies.slice(0, 7)) {
      links.push({ to: `/daily/${wd.slug}`, label: wd.title, icon: Calendar, hint: formatDate(wd.date) })
    }
    // Parent monthly
    const monthlys = getAllMonthly()
    const parentMonth = monthlys.find((m) => m.slug === ym)
    if (parentMonth) links.push({ to: `/monthly/${parentMonth.slug}`, label: parentMonth.title, icon: ArrowUp, hint: '所属月报' })
    // Parent quarterly
    const quarterlies = getAllQuarterly()
    const qSlug = `${yearKey}-${quarter}`
    const parentQ = quarterlies.find((q) => q.slug === qSlug)
    if (parentQ) links.push({ to: `/quarterly/${parentQ.slug}`, label: parentQ.title, icon: ArrowUp, hint: '所属季报' })
  }

  if (type === 'monthly') {
    // Weeklies in this month
    const allWeeklies = getAllWeekly()
    const monthWeeklies = allWeeklies.filter((w) => w.date && w.date.startsWith(ym))
    for (const mw of monthWeeklies.slice(0, 5)) {
      links.push({ to: `/weekly/${mw.slug}`, label: mw.title, icon: Calendar, hint: mw.slug })
    }
    // Parent quarterly
    const quarterlies = getAllQuarterly()
    const qSlug = `${yearKey}-${quarter}`
    const parentQ = quarterlies.find((q) => q.slug === qSlug)
    if (parentQ) links.push({ to: `/quarterly/${parentQ.slug}`, label: parentQ.title, icon: ArrowUp, hint: '所属季报' })
    // Parent annual
    const annuals = getAllAnnual()
    const parentYear = annuals.find((a) => a.slug.includes(yearKey))
    if (parentYear) links.push({ to: `/annual/${parentYear.slug}`, label: parentYear.title, icon: ArrowUp, hint: '所属年报' })
  }

  if (type === 'quarterly') {
    // Monthlys in this quarter
    const qNum = parseInt(quarter.slice(1))
    const monthsInQ = [(qNum - 1) * 3 + 1, (qNum - 1) * 3 + 2, qNum * 3]
    const monthlys = getAllMonthly()
    for (const m of monthsInQ) {
      const mSlug = `${yearKey}-${String(m).padStart(2, '0')}`
      const found = monthlys.find((x) => x.slug === mSlug)
      if (found) links.push({ to: `/monthly/${found.slug}`, label: found.title, icon: Calendar })
    }
    // Parent annual
    const annuals = getAllAnnual()
    const parentYear = annuals.find((a) => a.slug.includes(yearKey))
    if (parentYear) links.push({ to: `/annual/${parentYear.slug}`, label: parentYear.title, icon: ArrowUp, hint: '所属年报' })
  }

  if (links.length === 0) return null

  return (
    <div className="mt-8 border-t border-border pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-dim">关联报告</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-card px-3 py-1.5 text-xs text-body transition-colors hover:border-border hover:bg-muted hover:text-primary-hover"
            >
              <Icon className="h-3 w-3 text-dim" />
              <span className="line-clamp-1">{link.label}</span>
              {link.hint && <span className="text-[10px] text-placeholder">({link.hint})</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
