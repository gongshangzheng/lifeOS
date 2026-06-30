import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import {
  getAllDaily,
  getAllWeekly,
  getAllMonthly,
  getAllQuarterly,
  getAllAnnual,
  getAllVision,
  getAllAppendix,
} from '@/content/loader'

function getIsoWeekKey(d: Date): string {
  // ISO-8601 week number — operate in UTC to stay consistent with Velite isodate.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="lo-card lo-card-hover p-4">
      <div className="text-[11px] uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-1.5 text-xl font-semibold text-heading">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-dim">{hint}</div>}
    </div>
  )
}

export function Home() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const weekKey = getIsoWeekKey(now)

  const stats = useMemo(() => {
    const daily = getAllDaily()
    const monthlyCount = daily.filter((d) => d.date?.startsWith(ym)).length
    const latest = daily[0]
    const weeklyThisWeek = getAllWeekly().filter((w) => {
      if (!w.date) return false
      return getIsoWeekKey(new Date(w.date)) === weekKey
    }).length
    const total =
      daily.length +
      getAllWeekly().length +
      getAllMonthly().length +
      getAllQuarterly().length +
      getAllAnnual().length +
      getAllVision().length +
      getAllAppendix().length
    return { monthlyCount, latest, weeklyThisWeek, total, dailyTotal: daily.length }
  }, [ym, weekKey])

  return (
    <section className="space-y-4">
      <h1 className="lo-section-title">lifeOS Dashboard</h1>
      <p className="text-sm text-dim">当前时间</p>
      <p className="font-mono text-3xl text-heading">
        {now.toLocaleString('zh-CN', { hour12: false })}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={`本月日报（${ym}）`}
          value={stats.monthlyCount}
          hint={`累计 ${stats.dailyTotal} 篇`}
        />
        <StatCard
          label={`本周周报（${weekKey}）`}
          value={stats.weeklyThisWeek}
          hint="按 ISO 周计算"
        />
        {stats.latest ? (
          <Link
            to={`/daily/${stats.latest.slug}`}
            className="lo-card lo-card-hover group block p-4 transition-colors hover:border-primary/50"
          >
            <div className="text-[11px] uppercase tracking-wider text-dim">最新日报</div>
            <div className="mt-1.5 flex items-start justify-between gap-2">
              <span className="lo-clamp-2 text-sm font-semibold text-heading group-hover:text-primary-hover">
                {stats.latest.title}
              </span>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-dim group-hover:text-primary" />
            </div>
            <div className="mt-1 font-mono text-[11px] text-dim">
              {stats.latest.date?.slice(0, 10)}
            </div>
          </Link>
        ) : (
          <StatCard label="最新日报" value="—" />
        )}
        <StatCard
          label="累计报告"
          value={stats.total}
          hint="日报+周报+月报+季报+年报+愿景+附录"
        />
      </div>
    </section>
  )
}
