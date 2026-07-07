import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import {
  getAllDaily,
  getAllWeekly,
  getAllMonthly,
  getAllQuarterly,
  getAllAnnual,
  getAllVision,
  getAllAppendix,
  getAllProjects,
  getProjectTasks,
  countTasks,
  type TaskTree,
} from '@/content/loader'
import { stripMarkdown } from '@/lib/markdown'

// ── Helpers ──────────────────────────────────────────────────

function getIsoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function getQuarterKey(d: Date): string {
  const q = Math.ceil((d.getMonth() + 1) / 3)
  return `${d.getFullYear()}-Q${q}`
}

// ── Stat Card ────────────────────────────────────────────────

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="lo-card lo-card-hover p-4">
      <div className="text-[11px] uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-1.5 text-xl font-semibold text-heading">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-dim">{hint}</div>}
    </div>
  )
}

// ── Report Card (clickable link to a report) ────────────────

interface ReportLike {
  slug: string
  title: string
  date?: string
}

function ReportCard({
  label,
  report,
  to,
}: {
  label: string
  report: ReportLike | undefined
  to: (slug: string) => string
}) {
  if (!report) {
    return <StatCard label={label} value="—" />
  }
  return (
    <Link
      to={to(report.slug)}
      className="lo-card lo-card-hover group block p-4 transition-colors hover:border-primary/50"
    >
      <div className="text-[11px] uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <span className="lo-clamp-2 text-sm font-semibold text-heading group-hover:text-primary-hover">
          {report.title}
        </span>
        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-dim group-hover:text-primary" />
      </div>
      {report.date && (
        <div className="mt-1 font-mono text-[11px] text-dim">
          {report.date.slice(0, 10)}
        </div>
      )}
    </Link>
  )
}

// ── Quick Nav Card ───────────────────────────────────────────

function QuickNavCard({
  title,
  links,
}: {
  title: string
  links: Array<{ to: string; label: string; hint?: string }>
}) {
  if (links.length === 0) return null
  return (
    <div className="lo-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-dim">{title}</h3>
      <div className="mt-3 space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-center justify-between rounded-md border border-border-subtle bg-background px-3 py-2 transition-colors hover:border-border hover:bg-muted"
          >
            <span className="truncate text-sm text-body group-hover:text-primary-hover">
              {link.label}
            </span>
            <div className="flex items-center gap-2">
              {link.hint && <span className="text-[10px] text-placeholder">{link.hint}</span>}
              <ChevronRight className="h-3.5 w-3.5 text-placeholder group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Contribution Heatmap ──────────────────────────────────────

function ContributionHeatmap() {
  const { weeks, months, streakDays } = useMemo(() => {
    const dailies = getAllDaily()
    const dateSet = new Set(dailies.map((d) => d.date?.slice(0, 10)))

    // Generate last ~26 weeks (half year)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalDays = 26 * 7 // 182 days
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - totalDays + 1)
    // Adjust to start on Monday
    const startDay = startDate.getDay()
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay
    startDate.setDate(startDate.getDate() + mondayOffset)

    const allDays: Array<{ date: string; hasReport: boolean }> = []
    const d = new Date(startDate)
    while (d <= today) {
      const ds = d.toISOString().slice(0, 10)
      allDays.push({ date: ds, hasReport: dateSet.has(ds) })
      d.setDate(d.getDate() + 1)
    }

    // Group into weeks (columns)
    const wks: Array<Array<{ date: string; hasReport: boolean }>> = []
    for (let i = 0; i < allDays.length; i += 7) {
      wks.push(allDays.slice(i, i + 7))
    }

    // Month labels (first week of each month)
    const mos: Array<{ label: string; col: number }> = []
    let lastMonth = ''
    wks.forEach((week, col) => {
      const m = week[0]?.date?.slice(0, 7) ?? ''
      if (m && m !== lastMonth) {
        mos.push({ label: m.slice(5), col })
        lastMonth = m
      }
    })

    // Current streak
    let streak = 0
    const td = new Date(today)
    while (dateSet.has(td.toISOString().slice(0, 10))) {
      streak++
      td.setDate(td.getDate() - 1)
    }

    return { weeks: wks, months: mos, totalCount: dailies.length, streakDays: streak }
  }, [])

  const DAY_LABELS = ['', '一', '', '三', '', '五', '']

  return (
    <div className="lo-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">日报热力图</h2>
        <div className="flex items-center gap-3 text-[11px] text-dim">
          <span>连续 {streakDays} 天</span>
          <Link to="/daily" className="hover:text-primary">查看全部 →</Link>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-1 pb-1 pl-6">
          {months.map((m, i) => (
            <span
              key={i}
              className="text-[9px] text-placeholder"
              style={{ position: 'relative', left: `${m.col * 14}px` }}
            >
              {m.label}月
            </span>
          ))}
        </div>
        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-1.5 pt-0.5">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-3 text-[9px] leading-3 text-placeholder">
                {label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, di) => {
                  const day = week[di]
                  if (!day) return <div key={di} className="h-3 w-3" />
                  return (
                    <div
                      key={di}
                      className={`h-3 w-3 rounded-sm transition-colors ${
                        day.hasReport ? 'bg-green-500' : 'bg-muted'
                      } hover:ring-1 hover:ring-primary`}
                      title={`${day.date}${day.hasReport ? ' ✓' : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-dim">
          <span>少</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-muted" />
          <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
          <span>多</span>
        </div>
      </div>
    </div>
  )
}

// ── Live Clock (isolated 1s re-render) ───────────────────────

function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="lo-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-dim">当前时间</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-heading">
        {now.toLocaleString('zh-CN', { hour12: false })}
      </p>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────

export function Home() {
  const now = useMemo(() => new Date(), [])
  const [taskTrees, setTaskTrees] = useState<Record<string, TaskTree | null>>({})

  // Load task trees for active projects
  useEffect(() => {
    const projects = getAllProjects().filter((p) => p.status === 'active')
    for (const p of projects) {
      getProjectTasks(p.slug).then((tree) => {
        if (tree) {
          setTaskTrees((prev) => ({ ...prev, [p.slug]: tree }))
        }
      })
    }
  }, [])

  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const weekKey = getIsoWeekKey(now)
  const quarterKey = getQuarterKey(now)

  const stats = useMemo(() => {
    const daily = getAllDaily()
    const weekly = getAllWeekly()
    const monthly = getAllMonthly()
    const quarterly = getAllQuarterly()
    const annual = getAllAnnual()
    const monthlyCount = daily.filter((d) => d.date?.startsWith(ym)).length
    const total =
      daily.length +
      weekly.length +
      monthly.length +
      quarterly.length +
      annual.length +
      getAllVision().length +
      getAllAppendix().length
    return {
      monthlyCount,
      total,
      dailyTotal: daily.length,
      latestDaily: daily[0],
      latestWeekly: weekly[0],
      latestMonthly: monthly[0],
      latestQuarterly: quarterly[0],
      latestAnnual: annual[0],
    }
  }, [ym, weekKey])

  // Recent dailies (last 5)
  const recentDailies = useMemo(() => getAllDaily().slice(0, 5), [])
  // Recent weeklies (last 5)
  const recentWeeklies = useMemo(() => getAllWeekly().slice(0, 5), [])

  // Quick nav: current week/month/quarter/year
  const quickLinks = useMemo(() => {
    const links: Array<{ to: string; label: string; hint?: string }> = []
    const weeklies = getAllWeekly()
    const monthlys = getAllMonthly()
    const quarterlies = getAllQuarterly()
    const annuals = getAllAnnual()

    const thisWeek = weeklies.find((w) => w.slug.includes(weekKey))
    if (thisWeek) links.push({ to: `/weekly/${thisWeek.slug}`, label: thisWeek.title, hint: weekKey })

    const thisMonth = monthlys.find((m) => m.slug === ym)
    if (thisMonth) links.push({ to: `/monthly/${thisMonth.slug}`, label: thisMonth.title, hint: ym })

    const thisQuarter = quarterlies.find((q) => q.slug === quarterKey)
    if (thisQuarter) links.push({ to: `/quarterly/${thisQuarter.slug}`, label: thisQuarter.title, hint: quarterKey })

    const thisYear = annuals.find((a) => a.slug.includes(String(now.getFullYear())))
    if (thisYear) links.push({ to: `/annual/${thisYear.slug}`, label: thisYear.title, hint: String(now.getFullYear()) })

    return links
  }, [weekKey, ym, quarterKey, now])

  const activeProjects = useMemo(() => getAllProjects().filter((p) => p.status === 'active'), [])

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="lo-section-title">lifeOS Dashboard</h1>
        <p className="lo-section-desc">个人生活操作系统 — 愿景、计划、进展与反思。</p>
      </header>

      {/* Time display + Heatmap */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <LiveClock />
        <ContributionHeatmap />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label={`本月日报（${ym}）`}
          value={stats.monthlyCount}
          hint={`累计 ${stats.dailyTotal} 篇`}
        />
        <ReportCard label="最新日报" report={stats.latestDaily} to={(slug) => `/daily/${slug}`} />
        <ReportCard label="最新周报" report={stats.latestWeekly} to={(slug) => `/weekly/${slug}`} />
        <ReportCard label="最新月报" report={stats.latestMonthly} to={(slug) => `/monthly/${slug}`} />
        <ReportCard label="最新季报" report={stats.latestQuarterly} to={(slug) => `/quarterly/${slug}`} />
        <ReportCard label="最新年报" report={stats.latestAnnual} to={(slug) => `/annual/${slug}`} />
      </div>

      {/* Two-column layout: recent reports + quick nav */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent reports */}
        <div className="space-y-6">
          {/* Recent dailies */}
          <div className="lo-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">近期日报</h2>
              <Link to="/daily" className="text-[11px] text-dim transition-colors hover:text-primary">
                查看全部 →
              </Link>
            </div>
            {recentDailies.length === 0 ? (
              <p className="mt-3 text-sm text-dim">还没有日报。</p>
            ) : (
              <div className="mt-3 space-y-2">
                {recentDailies.map((d) => {
                  const summary = d.summary ? stripMarkdown(d.summary) : ''
                  return (
                    <Link
                      key={d.slug}
                      to={`/daily/${d.slug}`}
                      className="group block rounded-md border border-border-subtle bg-background p-3 transition-colors hover:border-border hover:bg-muted"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-heading group-hover:text-primary-hover">
                          {d.title}
                        </span>
                        <span className="flex-shrink-0 font-mono text-[11px] text-dim">
                          {d.date?.slice(0, 10)}
                        </span>
                      </div>
                      {summary && (
                        <p className="mt-1 line-clamp-1 text-xs text-body">{summary}</p>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent weeklies */}
          <div className="lo-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">近期周报</h2>
              <Link to="/weekly" className="text-[11px] text-dim transition-colors hover:text-primary">
                查看全部 →
              </Link>
            </div>
            {recentWeeklies.length === 0 ? (
              <p className="mt-3 text-sm text-dim">还没有周报。</p>
            ) : (
              <div className="mt-3 space-y-2">
                {recentWeeklies.map((w) => {
                  const summary = w.summary ? stripMarkdown(w.summary) : ''
                  return (
                    <Link
                      key={w.slug}
                      to={`/weekly/${w.slug}`}
                      className="group block rounded-md border border-border-subtle bg-background p-3 transition-colors hover:border-border hover:bg-muted"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-heading group-hover:text-primary-hover">
                          {w.title}
                        </span>
                        <span className="flex-shrink-0 font-mono text-[11px] text-dim">
                          {w.date?.slice(0, 10)}
                        </span>
                      </div>
                      {summary && (
                        <p className="mt-1 line-clamp-1 text-xs text-body">{summary}</p>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick nav sidebar */}
        <div className="space-y-4">
          <QuickNavCard title="当前周期" links={quickLinks} />

          {/* Active projects */}
          {activeProjects.length > 0 && (
            <div className="lo-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-dim">
                  活跃项目
                </h3>
                <Link to="/projects" className="text-[10px] text-dim hover:text-primary">
                  →
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {activeProjects.map((p) => {
                  const tree = taskTrees[p.slug]
                  const taskStats = tree ? countTasks(tree.tasks) : null
                  return (
                    <Link
                      key={p.slug}
                      to="/projects"
                      className="group block"
                    >
                      <div className="text-sm font-medium text-body group-hover:text-primary-hover">
                        {p.title}
                      </div>
                      {taskStats && taskStats.total > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-green-500 transition-all"
                              style={{ width: `${(taskStats.completed / taskStats.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-placeholder">
                            {taskStats.completed}/{taskStats.total}
                          </span>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
