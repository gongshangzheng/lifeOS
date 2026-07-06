import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { getAllDaily } from '@/content/loader'

// ── Types ────────────────────────────────────────────────────

type HabitRecord = {
  date: string // YYYY-MM-DD
  tag: string
  description: string
  done: boolean
}

// ── Parse tagged habits from daily reports ───────────────────

/**
 * Matches GFM task list items with a trailing `#tag`:
 *   - [x] 跑步 30min #健身
 *   - [ ] 阅读 #学习
 * Items without a `#tag` suffix are ignored.
 */
function parseTaggedHabits(): {
  records: HabitRecord[]
  tags: string[]
  dates: string[]
} {
  const dailies = getAllDaily()
  const records: HabitRecord[] = []
  const tagSet = new Set<string>()
  const dateSet = new Set<string>()

  // Match: "- [x] some text #tag" or "- [ ] some text #tag"
  // The #tag must be at the end (after optional whitespace)
  const lineRegex = /^[-*]\s+\[(x| )\]\s+(.+?)\s+#(\S+)\s*$/gim

  for (const d of dailies) {
    if (!d.date || !d.body) continue
    const dateStr = d.date.slice(0, 10)

    let match: RegExpExecArray | null
    while ((match = lineRegex.exec(d.body)) !== null) {
      const done = match[1].toLowerCase() === 'x'
      const description = match[2].trim()
      const tag = match[3]

      records.push({ date: dateStr, tag, description, done })
      tagSet.add(tag)
      dateSet.add(dateStr)
    }
  }

  return {
    records,
    tags: [...tagSet].sort(),
    dates: [...dateSet].sort(),
  }
}

// ── Heatmap Cell ─────────────────────────────────────────────

function HeatmapCell({
  value,
  title,
}: {
  value: 'empty' | 'done' | 'pending'
  title: string
}) {
  const colors = {
    empty: 'bg-muted',
    done: 'bg-green-500',
    pending: 'bg-amber-500/40',
  }
  return (
    <div
      className={`h-3 w-3 rounded-sm ${colors[value]} transition-colors hover:ring-1 hover:ring-primary`}
      title={title}
    />
  )
}

// ── Main Component ───────────────────────────────────────────

export function HabitsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const { records, tags, dates } = useMemo(() => parseTaggedHabits(), [])

  const filteredRecords = useMemo(() => {
    if (!selectedTag) return records
    return records.filter((r) => r.tag === selectedTag)
  }, [records, selectedTag])

  // Build matrix: tag -> date -> { done: boolean, desc: string }
  const matrix = useMemo(() => {
    const m = new Map<string, Map<string, { done: boolean; desc: string }>>()
    for (const r of filteredRecords) {
      if (!m.has(r.tag)) m.set(r.tag, new Map())
      // If multiple entries for same tag+date, prefer done
      const existing = m.get(r.tag)!.get(r.date)
      if (!existing || (!existing.done && r.done)) {
        m.get(r.tag)!.set(r.date, { done: r.done, desc: r.description })
      }
    }
    return m
  }, [filteredRecords])

  // Stats
  const stats = useMemo(() => {
    const doneCount = records.filter((r) => r.done).length
    const total = records.length
    return {
      doneCount,
      total,
      rate: total > 0 ? Math.round((doneCount / total) * 100) : 0,
      tagCount: tags.length,
      dayCount: dates.length,
    }
  }, [records, tags, dates])

  // Filtered dates (only dates that have records for selected tag)
  const filteredDates = useMemo(() => {
    if (!selectedTag) return dates
    const dateSet = new Set(filteredRecords.map((r) => r.date))
    return dates.filter((d) => dateSet.has(d))
  }, [dates, filteredRecords, selectedTag])

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="lo-section-title">Habits</h1>
        </div>
        <p className="lo-section-desc">
          在日报中使用 <code className="lo-code">- [x] 描述 #标签</code> 格式记录习惯。
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">标签数</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">{stats.tagCount}</div>
        </div>
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">记录天数</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">{stats.dayCount}</div>
        </div>
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">完成次数</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">{stats.doneCount}</div>
        </div>
        <div className="lo-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">完成率</div>
          <div className="mt-1.5 text-xl font-semibold text-heading">{stats.rate}%</div>
        </div>
      </div>

      {/* Tag filter chips */}
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

      {/* Heatmap */}
      {filteredDates.length === 0 ? (
        <div className="lo-card p-8 text-center">
          <Activity className="mx-auto h-10 w-10 text-placeholder" />
          <p className="mt-3 text-sm text-dim">
            日报中还没有带标签的习惯记录。
          </p>
          <p className="mt-2 text-xs text-dim">
            使用 <code className="lo-code">- [x] 跑步 #健身</code> 或{' '}
            <code className="lo-code">- [ ] 阅读 #娱乐</code> 格式。
          </p>
        </div>
      ) : (
        <div className="lo-card overflow-x-auto p-4">
          <h2 className="mb-4 text-sm font-semibold text-heading">打卡热力图</h2>

          {/* Date header */}
          <div className="flex gap-1 pb-2">
            <div className="w-24 flex-shrink-0" />
            {filteredDates.map((d) => (
              <div key={d} className="w-3 flex-shrink-0">
                <div className="rotate-90 text-[8px] text-placeholder" title={d}>
                  {d.slice(5)}
                </div>
              </div>
            ))}
          </div>

          {/* Tag rows */}
          <div className="space-y-1">
            {[...matrix.keys()].map((tag) => {
              const rowMap = matrix.get(tag)!
              return (
                <div key={tag} className="flex items-center gap-1">
                  <div
                    className="w-24 flex-shrink-0 truncate text-xs text-body"
                    title={tag}
                  >
                    #{tag}
                  </div>
                  {filteredDates.map((date) => {
                    const cell = rowMap.get(date)
                    const value = !cell ? 'empty' : cell.done ? 'done' : 'pending'
                    return (
                      <HeatmapCell
                        key={date}
                        value={value}
                        title={`#${tag} · ${date} · ${
                          cell
                            ? cell.done
                              ? `✓ ${cell.desc}`
                              : `✗ ${cell.desc}`
                            : '无记录'
                        }`}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-[10px] text-dim">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
              已完成
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/40" />
              未完成
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
              无记录
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
