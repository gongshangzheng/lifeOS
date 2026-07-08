import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventInput } from '@fullcalendar/core'
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, FileText, Download, Check, Circle, AlertCircle } from 'lucide-react'
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

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  study: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
  health: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#4ade80' },
  work: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  social: { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#f472b6' },
  life: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#a78bfa' },
  other: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', text: '#9ca3af' },
}

const PROJECT_TASK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'dingtalk-digital-human': { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
  lifeos: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#a78bfa' },
  'self-improvement': { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  'interpersonal-relationships': { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#f472b6' },
  'internship-projects': { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.4)', text: '#22d3ee' },
  'infrared-contour-compression': { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.4)', text: '#fb7185' },
  'pet-action-recognition': { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#fb923c' },
  internwiki: { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.4)', text: '#2dd4bf' },
  academics: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
}

const DEFAULT_TASK_COLOR = { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#818cf8' }

const COMPLETED_TASK_COLOR = { bg: 'rgba(113,113,122,0.12)', border: 'rgba(113,113,122,0.25)', text: '#a1a1aa' }

/** Get colors for an event: project color takes priority over category color */
function getEventColors(event: { project?: string; category?: string }) {
  if (event.project && PROJECT_TASK_COLORS[event.project]) {
    return PROJECT_TASK_COLORS[event.project]
  }
  return CATEGORY_COLORS[event.category ?? 'other'] ?? CATEGORY_COLORS.other
}

/** Check if a pending (non-completed) task is overdue — its scheduled time has passed */
function isTaskOverdue(task: TaskNode, todayStr: string, nowTime: string): boolean {
  if (task.status === 'completed') return false
  if (!task.startDate) return false

  // Timed task: check if end time has passed today
  if (task.startTime) {
    if (task.startDate < todayStr) return true
    if (task.startDate === todayStr) {
      if (task.endTime) return task.endTime <= nowTime
      return task.startTime <= nowTime
    }
    return false
  }

  // All-day task with endDate: overdue if endDate < today
  if (task.endDate && task.endDate < todayStr) return true

  // All-day task without endDate: overdue if startDate < today
  if (!task.endDate && task.startDate < todayStr) return true

  return false
}

// ── Converters ───────────────────────────────────────────────

function toFullCalendarEvents(events: CalendarEvent[]): EventInput[] {
  return events.map((e) => {
    const colors = getEventColors({ project: e.project || undefined, category: e.category })
    return {
      id: e.id,
      title: e.title,
      start: e.startTime ? `${e.date}T${e.startTime}` : e.date,
      end: e.endTime ? `${e.date}T${e.endTime}` : undefined,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      extendedProps: {
        category: e.category ?? 'other',
        location: e.location ?? '',
        description: e.description ?? '',
        source: 'event',
        project: e.project ?? '',
        colorText: colors.text,
      },
    }
  })
}

function taskNodesToFCEvents(
  datedTasks: Array<TaskNode & { projectSlug: string }>,
): EventInput[] {
  return datedTasks.map((t) => {
    const startDate = t.startDate!
    const isCompleted = t.status === 'completed'
    const colors = isCompleted
      ? COMPLETED_TASK_COLOR
      : (PROJECT_TASK_COLORS[t.projectSlug] ?? DEFAULT_TASK_COLOR)
    const commonProps = {
      id: `task-${t.projectSlug}-${t.id}`,
      title: `[${t.projectSlug}] ${t.title}`,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      extendedProps: {
        source: 'task' as const,
        projectSlug: t.projectSlug,
        taskStatus: t.status,
        description: t.description ?? '',
        location: t.location ?? '',
        category: t.category ?? 'work',
        taskChildrenCount: t.children?.length ?? 0,
        colorText: colors.text,
        isCompleted,
      },
    }
    if (t.startTime) {
      return {
        ...commonProps,
        start: `${startDate}T${t.startTime}`,
        end: t.endTime ? `${startDate}T${t.endTime}` : undefined,
      }
    }
    // All-day event
    const endDate = t.endDate ?? startDate
    const endExclusive = new Date(endDate)
    endExclusive.setDate(endExclusive.getDate() + 1)
    return {
      ...commonProps,
      start: startDate,
      end: t.endDate ? endExclusive.toISOString().slice(0, 10) : undefined,
      allDay: true,
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
          location: r.location,
          category: r.category ?? 'work',
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

    loadTasks.then((tasks) => {
      // Expand project recurring tasks into calendar events
      const projectRecurringEvents = expandProjectRecurring(tasks.recurring, rangeStartStr, rangeEndStr)
      setEvents(projectRecurringEvents)
      setDatedTasks(tasks.dated)
      setUndatedTasks(tasks.undated)
      setLoading(false)
    })
  }, [])

  const fcEvents = [
    ...toFullCalendarEvents(events),
    ...taskNodesToFCEvents(datedTasks),
  ]

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const todayEvents = events.filter((e) => e.date === today)
  const todayTasks = datedTasks.filter(
    (t) => t.startDate && t.startDate <= today && (!t.endDate || t.endDate >= today),
  )

  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed')

  // All pending tasks scheduled for today or earlier (includes overdue)
  const allPendingDatedTasks = datedTasks.filter(
    (t) => t.status !== 'completed' && t.startDate && t.startDate <= today,
  )
  // Overdue: time has passed but not completed — sorted by startDate ascending (most overdue first)
  const overdueTasks = allPendingDatedTasks
    .filter((t) => isTaskOverdue(t, today, nowTime))
    .sort((a, b) => {
      const dateCmp = (a.startDate ?? '').localeCompare(b.startDate ?? '')
      if (dateCmp !== 0) return dateCmp
      return (a.startTime ?? '').localeCompare(b.startTime ?? '')
    })
  // Today's pending (not overdue) — sorted by startTime
  const todayPendingTasks = allPendingDatedTasks
    .filter((t) => !isTaskOverdue(t, today, nowTime))
    .sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
      if (a.startTime) return -1
      if (b.startTime) return 1
      return 0
    })

  // Completed tasks from all dated tasks (recently completed, within last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const completedDatedTasks = datedTasks.filter(
    (t) => t.status === 'completed' && t.startDate && new Date(t.startDate) >= thirtyDaysAgo,
  )

  const hasPendingItems = todayEvents.length > 0 || overdueTasks.length > 0 || todayPendingTasks.length > 0 || undatedTasks.length > 0
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
            eventDisplay="auto"
            slotEventOverlap={false}
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
              const isCompleted = arg.event.extendedProps.isCompleted as boolean | undefined
              const isPast = arg.event.end ? arg.event.end < new Date() : false
              const isOngoing =
                !isPast &&
                arg.event.start &&
                arg.event.start <= new Date() &&
                (!arg.event.end || arg.event.end > new Date())
              return (
                <div
                  className="rounded px-1.5 py-0.5 text-xs overflow-hidden"
                  style={{
                    color: 'var(--color-body)',
                    opacity: isCompleted ? 0.55 : isPast ? 0.5 : isOngoing ? 1 : 0.85,
                    fontWeight: isOngoing ? 600 : 400,
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
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
                    {todayEvents.length + overdueTasks.length + todayPendingTasks.length + undatedTasks.length}
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
                  {/* Overdue section */}
                  {overdueTasks.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        逾期
                        <span className="ml-0.5 text-red-400/60">{overdueTasks.length}</span>
                      </h2>
                      {overdueTasks.map((t) => {
                        return (
                          <div
                            key={`task-${t.projectSlug}-${t.id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 transition-colors hover:opacity-80"
                            onClick={() => setSelected({ kind: 'task', data: t })}
                          >
                            <AlertCircle className="h-3 w-3 flex-shrink-0 text-red-400" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body">{t.title}</div>
                              <div className="truncate text-[10px] text-dim">
                                {t.projectSlug} · {t.startDate}{t.startTime ? ` ${t.startTime}${t.endTime ? '-' + t.endTime : ''}` : ''}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Today section */}
                  {(todayEvents.length > 0 || todayPendingTasks.length > 0) && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                        今日
                        <span className="ml-1.5 text-placeholder">{todayEvents.length + todayPendingTasks.length}</span>
                      </h2>
                      {todayEvents.map((e) => {
                        const colors = getEventColors(e)
                        return (
                          <div
                            key={e.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 transition-colors hover:opacity-80"
                            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                            onClick={() => setSelected({ kind: 'event', data: e })}
                          >
                            <div className="text-[11px] font-medium" style={{ color: colors.text }}>
                              {e.startTime ?? '—'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body">{e.title}</div>
                              {e.location && <div className="truncate text-[11px] text-dim">{e.location}</div>}
                            </div>
                          </div>
                        )
                      })}
                      {todayPendingTasks.map((t) => {
                        const colors = PROJECT_TASK_COLORS[t.projectSlug] ?? DEFAULT_TASK_COLOR
                        return (
                          <div
                            key={`task-${t.projectSlug}-${t.id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 transition-colors hover:opacity-80"
                            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                            onClick={() => setSelected({ kind: 'task', data: t })}
                          >
                            {t.startTime ? (
                              <div className="text-[11px] font-medium" style={{ color: colors.text }}>
                                {t.startTime}
                              </div>
                            ) : (
                              <FolderKanban className="h-3 w-3 flex-shrink-0" style={{ color: colors.text }} />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body">{t.title}</div>
                              <div className="truncate text-[10px] text-dim">
                                {t.projectSlug}{t.location ? ` · ${t.location}` : ''}{t.startTime ? ` · ${t.startTime}${t.endTime ? '-' + t.endTime : ''}` : ''}
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
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 transition-colors hover:opacity-80"
                            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                            onClick={() => setSelected({ kind: 'task', data: t })}
                          >
                            <FolderKanban className="h-3 w-3 flex-shrink-0" style={{ color: colors.text }} />
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
                      {completedTodayTasks.map((t) => {
                        const colors = PROJECT_TASK_COLORS[t.projectSlug] ?? DEFAULT_TASK_COLOR
                        return (
                          <div
                            key={`task-${t.projectSlug}-${t.id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 opacity-60 transition-colors hover:opacity-90"
                            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                            onClick={() => setSelected({ kind: 'task', data: t })}
                          >
                            <Check className="h-3 w-3 flex-shrink-0 text-green-500" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-body line-through">{t.title}</div>
                              <div className="truncate text-[10px] text-dim">{t.projectSlug}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Recently completed (last 30 days) */}
                  {completedDatedTasks.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                        近期完成
                        <span className="ml-1.5 text-placeholder">{completedDatedTasks.length}</span>
                      </h2>
                      {completedDatedTasks.map((t) => {
                        const colors = PROJECT_TASK_COLORS[t.projectSlug] ?? DEFAULT_TASK_COLOR
                        return (
                          <div
                            key={`task-${t.projectSlug}-${t.id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2.5 opacity-60 transition-colors hover:opacity-90"
                            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
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
                        )
                      })}
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
                      <span className="text-dim">日期：</span>
                      <span className="font-mono">
                        {selected.data.startDate}
                        {selected.data.endDate ? ` → ${selected.data.endDate}` : ''}
                      </span>
                    </div>
                  )}
                  {selected.data.startTime && (
                    <div>
                      <span className="text-dim">时间：</span>
                      <span className="font-mono">
                        {selected.data.startTime}{selected.data.endTime ? ` - ${selected.data.endTime}` : ''}
                      </span>
                    </div>
                  )}
                  {selected.data.location && (
                    <div>
                      <span className="text-dim">地点：</span>
                      {selected.data.location}
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
