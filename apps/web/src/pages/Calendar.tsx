import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventInput } from '@fullcalendar/core'
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, FileText, Download, Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAllProjects, getProjectTasks, flattenDatedTasks, flattenUndatedTasks, findRecurringTasks, getAllDaily, type TaskNode, type RecurringConfig } from '@/content/loader'

// ── Types ────────────────────────────────────────────────────

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  description?: string
  project?: string
}

interface RecurringEvent {
  id: string
  title: string
  pattern: 'daily' | 'weekly' | 'every-N-days'
  every?: number
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  description?: string
  activeFrom: string
  activeUntil?: string | null
  excludeDates: string[]
  project?: string
}

/** Expand recurring events into individual instances for a date range */
function expandRecurring(
  recurring: RecurringEvent[],
  fromDate: string,
  toDate: string,
): CalendarEvent[] {
  const result: CalendarEvent[] = []
  for (const r of recurring) {
    const start = new Date(Math.max(new Date(fromDate).getTime(), new Date(r.activeFrom).getTime()))
    const end = r.activeUntil
      ? new Date(Math.min(new Date(toDate).getTime(), new Date(r.activeUntil).getTime()))
      : new Date(toDate)
    const excludeSet = new Set(r.excludeDates || [])
    let current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10)
      if (!excludeSet.has(dateStr)) {
        result.push({
          id: `evt-${dateStr.replace(/-/g, '')}-${r.id}`,
          title: r.title,
          date: dateStr,
          startTime: r.startTime,
          endTime: r.endTime,
          location: r.location,
          category: r.category,
          description: r.description,
          project: r.project,
        })
      }
      if (r.pattern === 'daily') current.setDate(current.getDate() + 1)
      else if (r.pattern === 'weekly') current.setDate(current.getDate() + 7)
      else if (r.pattern === 'every-N-days') current.setDate(current.getDate() + (r.every || 3))
      else break
    }
  }
  return result
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  study: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-400' },
  health: { bg: 'bg-green-500/15', border: 'border-green-500/40', text: 'text-green-400' },
  work: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400' },
  social: { bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-400' },
  life: { bg: 'bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-400' },
  other: { bg: 'bg-gray-500/15', border: 'border-gray-500/40', text: 'text-gray-400' },
}

const PROJECT_TASK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'dingtalk-digital-human': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  lifeos: { bg: 'bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-400' },
  'self-improvement': { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400' },
  'interpersonal-relationships': { bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-400' },
  'internship-projects': { bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  'infrared-contour-compression': { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-400' },
  'pet-action-recognition': { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400' },
}

const DEFAULT_TASK_COLOR = { bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-400' }

/** Get colors for an event: project color takes priority over category color */
function getEventColors(event: { project?: string; category?: string }) {
  if (event.project && PROJECT_TASK_COLORS[event.project]) {
    return PROJECT_TASK_COLORS[event.project]
  }
  return CATEGORY_COLORS[event.category ?? 'other'] ?? CATEGORY_COLORS.other
}

// ── Converters ───────────────────────────────────────────────

function toFullCalendarEvents(events: CalendarEvent[]): EventInput[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startTime ? `${e.date}T${e.startTime}` : e.date,
    end: e.endTime ? `${e.date}T${e.endTime}` : undefined,
    extendedProps: {
      category: e.category ?? 'other',
      location: e.location ?? '',
      description: e.description ?? '',
      source: 'event',
      project: e.project ?? '',
    },
  }))
}

function taskNodesToFCEvents(
  datedTasks: Array<TaskNode & { projectSlug: string }>,
): EventInput[] {
  return datedTasks.map((t) => {
    const startDate = t.startDate!
    const endDate = t.endDate ?? startDate
    // FullCalendar endDate is exclusive, so add 1 day for all-day events
    const endExclusive = new Date(endDate)
    endExclusive.setDate(endExclusive.getDate() + 1)
    return {
      id: `task-${t.projectSlug}-${t.id}`,
      title: `[${t.projectSlug}] ${t.title}`,
      start: startDate,
      end: t.endDate ? endExclusive.toISOString().slice(0, 10) : undefined,
      allDay: !t.startDate?.includes('T'),
      extendedProps: {
        source: 'task',
        projectSlug: t.projectSlug,
        taskStatus: t.status,
        description: t.description ?? '',
        taskChildrenCount: t.children?.length ?? 0,
      },
    }
  })
}

// ── Selected item (event or task) ────────────────────────────

type SelectedItem =
  | { kind: 'event'; data: CalendarEvent }
  | { kind: 'task'; data: TaskNode & { projectSlug: string } }

/** Expand project recurring tasks into CalendarEvent[] */
function expandProjectRecurring(
  tasks: Array<TaskNode & { projectSlug: string }>,
  fromDate: string,
  toDate: string,
): CalendarEvent[] {
  const result: CalendarEvent[] = []
  for (const t of tasks) {
    const r = t.recurring as RecurringConfig | undefined
    if (!r) continue
    const activeFrom = r.activeFrom || fromDate
    const start = new Date(Math.max(new Date(fromDate).getTime(), new Date(activeFrom).getTime()))
    const end = r.activeUntil
      ? new Date(Math.min(new Date(toDate).getTime(), new Date(r.activeUntil).getTime()))
      : new Date(toDate)
    const excludeSet = new Set(r.excludeDates || [])
    let current = new Date(start)
    while (current <= end) {
      const ds = current.toISOString().slice(0, 10)
      if (!excludeSet.has(ds)) {
        result.push({
          id: `ptask-${t.projectSlug}-${t.id}-${ds}`,
          title: `[${t.projectSlug}] ${t.title}`,
          date: ds,
          startTime: r.startTime,
          endTime: r.endTime,
          category: 'work',
          description: t.description ?? '',
          project: t.projectSlug,
        })
      }
      if (r.pattern === 'daily') current.setDate(current.getDate() + 1)
      else if (r.pattern === 'weekly') current.setDate(current.getDate() + 7)
      else if (r.pattern === 'every-N-days') current.setDate(current.getDate() + (r.every || 3))
      else break
    }
  }
  return result
}

// ── Component ────────────────────────────────────────────────

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [datedTasks, setDatedTasks] = useState<Array<TaskNode & { projectSlug: string }>>([])
  const [undatedTasks, setUndatedTasks] = useState<Array<TaskNode & { projectSlug: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SelectedItem | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'pending' | 'completed'>('pending')

  // Daily slugs for "view daily" links
  const dailySlugs = useMemo(() => {
    return new Set(getAllDaily().map((d) => d.slug))
  }, [])

  // Load events + task trees
  useEffect(() => {
    // Expand recurring events for a 3-month window (prev/next month around today)
    const now = new Date()
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    const rangeStartStr = rangeStart.toISOString().slice(0, 10)
    const rangeEndStr = rangeEnd.toISOString().slice(0, 10)

    const loadEvents = fetch('/lifeOS/events.json')
      .then((res) => res.json())
      .then((data) => {
        const oneTime = (data.events ?? []) as CalendarEvent[]
        const recurring = (data.recurring ?? []) as RecurringEvent[]
        const expanded = expandRecurring(recurring, rangeStartStr, rangeEndStr)
        // Merge: expanded recurring events that don't collide with existing event IDs
        const existingIds = new Set(oneTime.map((e) => e.id))
        const merged = [...oneTime, ...expanded.filter((e) => !existingIds.has(e.id))]
        return merged
      })
      .catch(() => [] as CalendarEvent[])

    const projects = getAllProjects()
    const loadTasks = Promise.all(
      projects.map(async (p) => {
        const tree = await getProjectTasks(p.slug)
        if (!tree) return { dated: [] as Array<TaskNode & { projectSlug: string }>, undated: [] as Array<TaskNode & { projectSlug: string }>, recurring: [] as Array<TaskNode & { projectSlug: string }> }
        return {
          dated: flattenDatedTasks(tree.tasks, p.slug),
          undated: flattenUndatedTasks(tree.tasks, p.slug),
          recurring: findRecurringTasks(tree.tasks, p.slug),
        }
      }),
    ).then((results) => ({
      dated: results.flatMap((r) => r.dated),
      undated: results.flatMap((r) => r.undated),
      recurring: results.flatMap((r) => r.recurring),
    }))

    Promise.all([loadEvents, loadTasks]).then(([evts, tasks]) => {
      // Expand project recurring tasks into calendar events
      const projectRecurringEvents = expandProjectRecurring(tasks.recurring, rangeStartStr, rangeEndStr)
      setEvents([...evts, ...projectRecurringEvents])
      setDatedTasks(tasks.dated)
      setUndatedTasks(tasks.undated)
      setLoading(false)
    })
  }, [])

  const fcEvents = [
    ...toFullCalendarEvents(events),
    ...taskNodesToFCEvents(datedTasks),
  ]

  const today = new Date().toISOString().slice(0, 10)
  const todayEvents = events.filter((e) => e.date === today)
  const todayTasks = datedTasks.filter(
    (t) => t.startDate && t.startDate <= today && (!t.endDate || t.endDate >= today),
  )

  // Split tasks into pending vs completed
  const pendingTodayTasks = todayTasks.filter((t) => t.status !== 'completed')
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed')

  // Completed tasks from all dated tasks (recently completed, within last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const completedDatedTasks = datedTasks.filter(
    (t) => t.status === 'completed' && t.startDate && new Date(t.startDate) >= thirtyDaysAgo,
  )

  const hasPendingItems = todayEvents.length > 0 || pendingTodayTasks.length > 0 || undatedTasks.length > 0
  const hasCompletedItems = completedTodayTasks.length > 0 || completedDatedTasks.length > 0
  const hasSidebarItems = hasPendingItems || hasCompletedItems

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="lo-section-title">Calendar</h1>
        <a
          href="/lifeOS/calendar.ics"
          download
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-dim transition-colors hover:bg-muted hover:text-heading"
        >
          <Download className="h-3.5 w-3.5" />
          下载 ICS
        </a>
      </div>

      <div className={cn('gap-4', hasSidebarItems ? 'grid grid-cols-1 lg:grid-cols-[1fr_280px]' : '')}>
        {/* Calendar */}
        <div className="lo-card lo-calendar min-w-0 p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-dim">加载中…</div>
          ) : (
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridThreeDay"
            views={{
              timeGridThreeDay: {
                type: 'timeGrid',
                duration: { days: 3 },
                buttonText: '3日',
              },
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridThreeDay,timeGridDay,listWeek',
            }}
            buttonText={{
              today: '今天',
              month: '月',
              week: '周',
              day: '日',
              list: '列表',
            }}
            locale="zh-cn"
            firstDay={1}
            nowIndicator
            events={fcEvents}
            height="auto"
            eventDisplay="block"
            eventClick={(info) => {
              const id = info.event.id
              // Check if it's a task event
              if (id.startsWith('task-')) {
                const task = datedTasks.find(
                  (t) => `task-${t.projectSlug}-${t.id}` === id,
                )
                if (task) setSelected({ kind: 'task', data: task })
              } else {
                const evt = events.find((e) => e.id === id)
                if (evt) setSelected({ kind: 'event', data: evt })
              }
            }}
            eventContent={(arg) => {
              const source = arg.event.extendedProps.source as string
              if (source === 'task') {
                const slug = arg.event.extendedProps.projectSlug as string
                const status = arg.event.extendedProps.taskStatus as string
                const isCompleted = status === 'completed'
                const colors = isCompleted
                  ? { bg: 'bg-zinc-500/15', border: 'border-zinc-500/30', text: 'text-zinc-400' }
                  : (PROJECT_TASK_COLORS[slug] ?? DEFAULT_TASK_COLOR)
                return (
                  <div className={`rounded px-1 py-0.5 text-xs ${colors.bg} ${isCompleted ? 'line-through opacity-60' : ''}`}>
                    {arg.event.title}
                  </div>
                )
              }
              const cat = arg.event.extendedProps.category as string
              const project = arg.event.extendedProps.project as string
              const colors = getEventColors({ project: project || undefined, category: cat })
              const isPast = arg.event.end ? arg.event.end < new Date() : false
              const isOngoing =
                !isPast &&
                arg.event.start &&
                arg.event.start <= new Date() &&
                (!arg.event.end || arg.event.end > new Date())
              const stateClass = isPast
                ? 'fc-event-past'
                : isOngoing
                  ? 'fc-event-ongoing'
                  : 'fc-event-future'
              return (
                <div className={`rounded px-1 py-0.5 text-xs ${colors.bg} ${stateClass}`}>
                  {arg.event.title}
                </div>
              )
            }}
          />
        )}
        </div>

        {/* Sidebar with tabs */}
        {hasSidebarItems && (
          <aside className="lo-card overflow-y-auto lg:max-h-[calc(100vh-8rem)] lg:sticky lg:top-20">
            {/* Tab headers */}
            <div className="flex border-b border-border">
              <button
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === 'pending'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-dim hover:text-body'
                }`}
                onClick={() => setSidebarTab('pending')}
              >
                <Circle className="h-3 w-3" />
                待办
                {hasPendingItems && (
                  <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                    {todayEvents.length + pendingTodayTasks.length + undatedTasks.length}
                  </span>
                )}
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === 'completed'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-dim hover:text-body'
                }`}
                onClick={() => setSidebarTab('completed')}
              >
                <Check className="h-3 w-3" />
                已完成
                {hasCompletedItems && (
                  <span className="ml-0.5 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] text-green-500">
                    {completedTodayTasks.length + completedDatedTasks.length}
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-4 p-4">
              {/* Pending tab */}
              {sidebarTab === 'pending' && (
                <>
                  {/* Today section */}
                  {(todayEvents.length > 0 || pendingTodayTasks.length > 0) && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">今日</h2>
                      {todayEvents.map((e) => {
                        const colors = getEventColors(e)
                        return (
                          <div
                            key={e.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border ${colors.border} ${colors.bg} p-2.5 transition-colors hover:opacity-80`}
                            onClick={() => setSelected({ kind: 'event', data: e })}
                          >
                            <div className={`text-[11px] font-medium ${colors.text}`}>
                              {e.startTime ?? '—'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body">{e.title}</div>
                              {e.location && <div className="truncate text-[11px] text-dim">{e.location}</div>}
                            </div>
                          </div>
                        )
                      })}
                      {pendingTodayTasks.map((t) => {
                        const colors = PROJECT_TASK_COLORS[t.projectSlug] ?? DEFAULT_TASK_COLOR
                        return (
                          <div
                            key={`task-${t.projectSlug}-${t.id}`}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border ${colors.border} ${colors.bg} p-2.5 transition-colors hover:opacity-80`}
                            onClick={() => setSelected({ kind: 'task', data: t })}
                          >
                            <FolderKanban className={`h-3 w-3 flex-shrink-0 ${colors.text}`} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body">{t.title}</div>
                              <div className="truncate text-[10px] text-dim">
                                {t.projectSlug} · {t.status}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Undated tasks section */}
                  {undatedTasks.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                        无日期
                        <span className="ml-1.5 text-placeholder">{undatedTasks.length}</span>
                      </h2>
                      {undatedTasks.map((t) => {
                        const colors = PROJECT_TASK_COLORS[t.projectSlug] ?? DEFAULT_TASK_COLOR
                        return (
                          <div
                            key={`task-${t.projectSlug}-${t.id}`}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border ${colors.border} ${colors.bg} p-2.5 transition-colors hover:opacity-80`}
                            onClick={() => setSelected({ kind: 'task', data: t })}
                          >
                            <FolderKanban className={`h-3 w-3 flex-shrink-0 ${colors.text}`} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body">{t.title}</div>
                              <div className="truncate text-[10px] text-dim">
                                {t.projectSlug} · {t.status}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!hasPendingItems && (
                    <div className="py-8 text-center text-xs text-dim">暂无待办事项</div>
                  )}
                </>
              )}

              {/* Completed tab */}
              {sidebarTab === 'completed' && (
                <>
                  {/* Today completed */}
                  {completedTodayTasks.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">今日完成</h2>
                      {completedTodayTasks.map((t) => (
                        <div
                          key={`task-${t.projectSlug}-${t.id}`}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-500/30 bg-zinc-500/15 p-2.5 opacity-70 transition-colors hover:opacity-90"
                          onClick={() => setSelected({ kind: 'task', data: t })}
                        >
                          <Check className="h-3 w-3 flex-shrink-0 text-green-500" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-body line-through">{t.title}</div>
                            <div className="truncate text-[10px] text-dim">{t.projectSlug}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recently completed (last 30 days) */}
                  {completedDatedTasks.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                        近期完成
                        <span className="ml-1.5 text-placeholder">{completedDatedTasks.length}</span>
                      </h2>
                      {completedDatedTasks.map((t) => (
                        <div
                          key={`task-${t.projectSlug}-${t.id}`}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-500/30 bg-zinc-500/15 p-2.5 opacity-70 transition-colors hover:opacity-90"
                          onClick={() => setSelected({ kind: 'task', data: t })}
                        >
                          <Check className="h-3 w-3 flex-shrink-0 text-green-500" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-body line-through">{t.title}</div>
                            <div className="truncate text-[10px] text-dim">
                              {t.projectSlug} · {t.startDate}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasCompletedItems && (
                    <div className="py-8 text-center text-xs text-dim">暂无已完成事项</div>
                  )}
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelected(null)}
        >
          <div
            className="lo-card mx-4 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.kind === 'event' ? (
              <>
                <h3 className="text-lg font-semibold text-heading">{selected.data.title}</h3>
                <div className="mt-3 space-y-2 text-sm text-body">
                  <div>
                    <span className="text-dim">时间：</span>
                    {selected.data.startTime ?? '—'} – {selected.data.endTime ?? '—'}
                  </div>
                  {selected.data.location && (
                    <div>
                      <span className="text-dim">地点：</span>
                      {selected.data.location}
                    </div>
                  )}
                  {selected.data.description && (
                    <div>
                      <span className="text-dim">备注：</span>
                      {selected.data.description}
                    </div>
                  )}
                  {dailySlugs.has(selected.data.date) && (
                    <Link
                      to={`/daily/${selected.data.date}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary-subtle px-3 py-1.5 text-xs font-medium text-primary-subtle-foreground transition-colors hover:bg-primary/20"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      查看当日日报
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-heading">{selected.data.title}</h3>
                </div>
                <div className="mt-3 space-y-2 text-sm text-body">
                  <div>
                    <span className="text-dim">项目：</span>
                    {selected.data.projectSlug}
                  </div>
                  <div>
                    <span className="text-dim">状态：</span>
                    {selected.data.status}
                  </div>
                  {selected.data.startDate && (
                    <div>
                      <span className="text-dim">时间：</span>
                      <span className="font-mono">
                        {selected.data.startDate}
                        {selected.data.endDate ? ` → ${selected.data.endDate}` : ''}
                      </span>
                    </div>
                  )}
                  {selected.data.description && (
                    <div>
                      <span className="text-dim">描述：</span>
                      {selected.data.description}
                    </div>
                  )}
                  {selected.data.children && selected.data.children.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-placeholder">
                        子任务 ({selected.data.children.filter((c) => c.status === 'completed').length}/{selected.data.children.length})
                      </span>
                      {selected.data.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-2 text-xs">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              child.status === 'completed'
                                ? 'bg-blue-500'
                                : child.status === 'active'
                                  ? 'bg-green-500'
                                  : 'bg-zinc-400'
                            }`}
                          />
                          <span className={child.status === 'completed' ? 'text-dim line-through' : 'text-body'}>
                            {child.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => setSelected(null)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
