import { useMemo, useState } from 'react'
import { Flame, Activity, Check, X } from 'lucide-react'
import { getAllDaily } from '@/content/loader'

// ── Types ────────────────────────────────────────────────────

interface HabitRecord {
  date: string
  checked: boolean
  label: string
  tag: string
}

interface Habit {
  label: string
  tag: string
  records: HabitRecord[]
  streak: number
  bestStreak: number
  rate: number
}

// ── Parse & calculate ────────────────────────────────────────

const HABIT_PATTERN = /^[-*]\s+\[([x ])\]\s+(.+?)\s+#(\S+)\s*$/i

function parseHabits(): { habits: Habit[]; tags: string[] } {
  const dailies = getAllDaily()
  const labelMap = new Map<string, HabitRecord[]>()
  const tagSet = new Set<string>()

  for (const d of dailies) {
    if (!d.date || !d.body) continue
    const dateStr = d.date.slice(0, 10)
    for (const line of d.body.split('\n')) {
      const match = line.match(HABIT_PATTERN)
      if (!match) continue
      const checked = match[1].toLowerCase() === 'x'
      const label = match[2].trim()
      const tag = match[3]
      tagSet.add(tag)
      const key = label.toLowerCase()
      if (!labelMap.has(key)) labelMap.set(key, [])
      labelMap.get(key)!.push({ date: dateStr, checked, label, tag })
    }
  }

  const habits: Habit[] = []
  for (const [, records] of labelMap) {
    const sorted = records.sort((a, b) => a.date.localeCompare(b.date))
    const { streak, bestStreak } = calcStreak(sorted)
    const checkedCount = sorted.filter((r) => r.checked).length
    const rate = sorted.length > 0 ? Math.round((checkedCount / sorted.length) * 100) : 0
    habits.push({
      label: sorted[0].label,
      tag: sorted[0].tag,
      records: sorted,
      streak,
      bestStreak,
      rate,
    })
  }

  habits.sort(
    (a, b) => b.streak - a.streak || b.bestStreak - a.bestStreak || a.label.localeCompare(b.label),
  )
  return { habits, tags: [...tagSet].sort() }
}

function calcStreak(records: HabitRecord[]): { streak: number; bestStreak: number } {
  const checkedDates = records.filter((r) => r.checked).map((r) => r.date).sort()
  if (checkedDates.length === 0) return { streak: 0, bestStreak: 0 }

  let best = 1
  let current = 1
  for (let i = 1; i < checkedDates.length; i++) {
    const prev = new Date(checkedDates[i - 1])
    const curr = new Date(checkedDates[i])
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) {
      current++
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }

  const sortedDesc = [...checkedDates].reverse()
  const today = new Date().toISOString().slice(0, 10)
  const lastChecked = sortedDesc[0]
  const daysSinceLast = Math.round(
    (new Date(today).getTime() - new Date(lastChecked).getTime()) / 86400000,
  )
  if (daysSinceLast > 1) return { streak: 0, bestStreak: best }

  let streak = 1
  for (let i = 1; i < sortedDesc.length; i++) {
    const prev = new Date(sortedDesc[i - 1])
    const curr = new Date(sortedDesc[i])
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diff === 1) streak++
    else break
  }

  return { streak, bestStreak: best }
}

// ── 30-Day Mini Heatmap ──────────────────────────────────────

function HabitHeatmap({ habit }: { habit: Habit }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days: Array<{ date: string; record?: HabitRecord }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const rec = habit.records.find((r) => r.date === ds)
    days.push({ date: ds, record: rec })
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day) => {
        const hasRecord = !!day.record
        const isChecked = day.record?.checked
        return (
          <div
            key={day.date}
            className={`h-4 w-4 rounded-sm transition-colors ${
              isChecked ? 'bg-green-500' : hasRecord ? 'bg-red-400/40' : 'bg-muted'
            }`}
            title={`${day.date}: ${isChecked ? '✓' : hasRecord ? '✗' : '—'}`}
          />
        )
      })}
    </div>
  )
}

// ── Habit Card ───────────────────────────────────────────────

function HabitCard({ habit }: { habit: Habit }) {
  const total = habit.records.length
  const checked = habit.records.filter((r) => r.checked).length

  return (
    <div className="lo-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame
            className={`h-4 w-4 ${habit.streak > 0 ? 'text-orange-500' : 'text-dim'}`}
          />
          <span className="text-sm font-semibold text-heading">{habit.label}</span>
        </div>
        <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-dim">
          #{habit.tag}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-500">
            <Flame className="h-3.5 w-3.5" />
            {habit.streak}
          </div>
          <div className="text-[10px] text-dim">连续</div>
        </div>
        <div>
          <div className="text-lg font-bold text-heading">{habit.bestStreak}</div>
          <div className="text-[10px] text-dim">最长</div>
        </div>
        <div>
          <div className="text-lg font-bold text-heading">{habit.rate}%</div>
          <div className="text-[10px] text-dim">{checked}/{total}</div>
        </div>
      </div>

      <div className="mt-4">
        <HabitHeatmap habit={habit} />
        <div className="mt-1 flex items-center justify-between text-[9px] text-placeholder">
          <span>30 天前</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-green-500" /> 完成
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-red-400/40" /> 未完成
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-muted" /> 无记录
            </span>
          </div>
          <span>今天</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────

export function HabitsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { habits, tags } = useMemo(() => parseHabits(), [])

  const filteredHabits = useMemo(() => {
    if (!selectedTag) return habits
    return habits.filter((h) => h.tag === selectedTag)
  }, [habits, selectedTag])

  const todayStr = new Date().toISOString().slice(0, 10)
  const checkedToday = habits.filter((h) => {
    const rec = h.records.find((r) => r.date === todayStr)
    return rec?.checked
  }).length
  const totalToday = habits.length
  const rateToday = totalToday > 0 ? Math.round((checkedToday / totalToday) * 100) : 0

  const totalRecords = habits.reduce((sum, h) => sum + h.records.length, 0)
  const totalChecked = habits.reduce((sum, h) => sum + h.records.filter((r) => r.checked).length, 0)
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0)

  const recentRecords = useMemo(() => {
    return habits
      .flatMap((h) => h.records.map((r) => ({ ...r, label: h.label })))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15)
  }, [habits])

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <h1 className="lo-section-title">Habits</h1>
            <p className="text-xs text-dim">从日报打卡记录自动生成</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-heading">
              {checkedToday}
              <span className="text-sm text-dim">/{totalToday}</span>
            </div>
            <div className="text-[10px] text-dim">今日打卡</div>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                rateToday >= 80 ? 'text-green-500' : rateToday >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}
            >
              {rateToday}%
            </div>
            <div className="text-[10px] text-dim">完成率</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">习惯数</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">{habits.length}</div>
        </div>
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">总记录</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">{totalRecords}</div>
        </div>
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">总完成率</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">
            {totalRecords > 0 ? Math.round((totalChecked / totalRecords) * 100) : 0}%
          </div>
        </div>
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">最长连续</div>
          <div className="mt-1.5 flex items-center gap-1 text-xl font-semibold text-orange-500">
            <Flame className="h-4 w-4" />
            {bestStreak}
          </div>
        </div>
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              !selectedTag
                ? 'border-primary/40 bg-primary-subtle text-primary-subtle-foreground'
                : 'border-border bg-card text-dim hover:bg-muted hover:text-heading'
            }`}
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                tag === selectedTag
                  ? 'border-primary/40 bg-primary-subtle text-primary-subtle-foreground'
                  : 'border-border bg-card text-dim hover:bg-muted hover:text-heading'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Habit cards */}
      {filteredHabits.length === 0 ? (
        <div className="lo-card p-8 text-center">
          <Activity className="mx-auto h-10 w-10 text-placeholder" />
          <p className="mt-3 text-sm text-dim">日报中还没有带标签的习惯记录。</p>
          <p className="mt-2 text-xs text-dim">
            使用 <code className="lo-code">- [x] 跑步 #健身</code> 或{' '}
            <code className="lo-code">- [ ] 阅读 #学习</code> 格式。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHabits.map((habit) => (
            <HabitCard key={habit.label} habit={habit} />
          ))}
        </div>
      )}

      {/* Recent activity log */}
      {recentRecords.length > 0 && (
        <div className="lo-card p-4">
          <h2 className="text-sm font-semibold text-heading">最近打卡</h2>
          <div className="mt-3 space-y-2">
            {recentRecords.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="font-mono text-dim">{r.date}</span>
                {r.checked ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-body">{r.label}</span>
                <span className="text-placeholder">#{r.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
