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

interface TagGroup {
  tag: string
  habits: Habit[]
  streak: number
  bestStreak: number
  rate: number
  activeDays: number
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

/** 合并同一 tag 下所有习惯的记录，计算组级别的连续天数和完成率 */
function calcGroupStats(habits: Habit[]): { streak: number; bestStreak: number; rate: number; activeDays: number } {
  const checkedDates = new Set<string>()
  const allDates = new Set<string>()

  for (const h of habits) {
    for (const r of h.records) {
      allDates.add(r.date)
      if (r.checked) checkedDates.add(r.date)
    }
  }

  const sortedChecked = [...checkedDates].sort()

  // 最长连续
  let best = 0
  let current = 0
  let prevDate: string | null = null
  for (const d of sortedChecked) {
    if (prevDate) {
      const diff = Math.round((new Date(d).getTime() - new Date(prevDate).getTime()) / 86400000)
      current = diff === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    best = Math.max(best, current)
    prevDate = d
  }

  // 当前连续（从今天往回数）
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  if (sortedChecked.length > 0) {
    const lastChecked = sortedChecked[sortedChecked.length - 1]
    const daysSince = Math.round((new Date(today).getTime() - new Date(lastChecked).getTime()) / 86400000)
    if (daysSince <= 1) {
      streak = 1
      for (let i = sortedChecked.length - 2; i >= 0; i--) {
        const diff = Math.round(
          (new Date(sortedChecked[i + 1]).getTime() - new Date(sortedChecked[i]).getTime()) / 86400000,
        )
        if (diff === 1) streak++
        else break
      }
    }
  }

  const activeDays = checkedDates.size
  const rate = allDates.size > 0 ? Math.round((checkedDates.size / allDates.size) * 100) : 0
  return { streak, bestStreak: best, rate, activeDays }
}

/** 按标签分组 */
function groupByTag(habits: Habit[]): TagGroup[] {
  const tagMap = new Map<string, Habit[]>()
  for (const h of habits) {
    if (!tagMap.has(h.tag)) tagMap.set(h.tag, [])
    tagMap.get(h.tag)!.push(h)
  }

  const groups: TagGroup[] = []
  for (const [tag, tagHabits] of tagMap) {
    const stats = calcGroupStats(tagHabits)
    groups.push({ tag, habits: tagHabits, ...stats })
  }

  groups.sort((a, b) => b.streak - a.streak || b.bestStreak - a.bestStreak || a.tag.localeCompare(b.tag))
  return groups
}

// ── Shared Heatmap for a tag group ───────────────────────────

function TagHeatmap({ habits }: { habits: Habit[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalHabits = habits.length

  const days: Array<{ date: string; checkedCount: number; recordCount: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    let checkedCount = 0
    let recordCount = 0
    for (const h of habits) {
      const rec = h.records.find((r) => r.date === ds)
      if (rec) {
        recordCount++
        if (rec.checked) checkedCount++
      }
    }
    days.push({ date: ds, checkedCount, recordCount })
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day) => {
        const hasRecord = day.recordCount > 0
        const isChecked = day.checkedCount > 0
        let bgClass = 'bg-muted'
        if (isChecked) {
          const ratio = day.checkedCount / totalHabits
          if (ratio >= 1) bgClass = 'bg-green-500'
          else if (ratio >= 0.5) bgClass = 'bg-green-500/70'
          else bgClass = 'bg-green-500/40'
        } else if (hasRecord) {
          bgClass = 'bg-red-400/40'
        }
        const tip = isChecked
          ? `${day.date}: ${day.checkedCount}/${totalHabits} 完成`
          : hasRecord
            ? `${day.date}: 全部未完成`
            : `${day.date}: 无记录`
        return (
          <div
            key={day.date}
            className={`h-4 w-4 rounded-sm transition-colors ${bgClass}`}
            title={tip}
          />
        )
      })}
    </div>
  )
}

// ── Tag Group Card (shared heatmap + individual habits) ──────

function TagGroupCard({ group }: { group: TagGroup }) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const { habits, tag, streak, bestStreak, rate, activeDays } = group
  const isMulti = habits.length > 1

  return (
    <div className="lo-card p-4">
      {/* Header: tag name + combined stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-dim'}`} />
          <span className="text-sm font-semibold text-heading">#{tag}</span>
          {isMulti && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-dim">
              {habits.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-dim">
          <span className="flex items-center gap-0.5">
            <Flame className="h-3 w-3 text-orange-500" />
            <strong className="text-orange-500">{streak}</strong>
          </span>
          <span>最长 <strong className="text-heading">{bestStreak}</strong></span>
          <span><strong className="text-heading">{rate}%</strong></span>
        </div>
      </div>

      {/* Shared heatmap */}
      <div className="mt-3">
        <TagHeatmap habits={habits} />
        <div className="mt-1 flex items-center justify-between text-[9px] text-placeholder">
          <span>30 天前</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-green-500" /> 全部完成
            </span>
            {isMulti && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-green-500/40" /> 部分
              </span>
            )}
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

      {/* Individual habits (only when multiple) */}
      {isMulti && (
        <div className="mt-4 max-h-32 overflow-y-auto border-t border-border pt-3">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-dim">
            {activeDays} 天活跃 · {habits.length} 个习惯
          </div>
          <div className="space-y-1.5">
            {habits.map((h) => {
              const todayRec = h.records.find((r) => r.date === todayStr)
              return (
                <div key={h.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {todayRec?.checked ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : todayRec ? (
                      <X className="h-3 w-3 text-red-400" />
                    ) : (
                      <div className="h-3 w-3 rounded-sm border border-border" />
                    )}
                    <span className="text-body">{h.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <span className="flex items-center gap-0.5">
                      <Flame className="h-3 w-3 text-orange-500/60" />
                      {h.streak}
                    </span>
                    <span>{h.rate}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────

export function HabitsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { habits, tags } = useMemo(() => parseHabits(), [])

  const allGroups = useMemo(() => groupByTag(habits), [habits])

  const filteredGroups = useMemo(() => {
    if (!selectedTag) return allGroups
    return allGroups.filter((g) => g.tag === selectedTag)
  }, [allGroups, selectedTag])

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
          {tags.map((tag) => {
            const count = allGroups.find((g) => g.tag === tag)?.habits.length ?? 0
            return (
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
                {count > 1 && <span className="ml-1 opacity-60">{count}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Tag group cards */}
      {filteredGroups.length === 0 ? (
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
          {filteredGroups.map((group) => (
            <TagGroupCard key={group.tag} group={group} />
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
