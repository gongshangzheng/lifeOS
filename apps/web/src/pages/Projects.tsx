import { useState } from 'react'
import { FolderKanban, GitBranch, Calendar, CheckCircle2, Pause, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAllProjects } from '@/content/loader'

// ── Types ────────────────────────────────────────────────────

type TimelineEvent = {
  date: string
  title: string
  type: string
  description?: string
}

type FlattenedEvent = TimelineEvent & {
  projectName: string
  projectSlug: string
  projectColor: (typeof PROJECT_COLORS)[number]
}

// ── Status config ────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Circle; color: string }
> = {
  active: { label: '进行中', icon: GitBranch, color: 'text-green-400' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'text-blue-400' },
  paused: { label: '已暂停', icon: Pause, color: 'text-amber-400' },
  planned: { label: '规划中', icon: Circle, color: 'text-dim' },
}

// Color palette for project tags — up to 12 distinct colors
const PROJECT_COLORS = [
  { name: 'emerald', dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { name: 'blue', dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'amber', dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { name: 'violet', dot: 'bg-violet-500', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  { name: 'pink', dot: 'bg-pink-500', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { name: 'cyan', dot: 'bg-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { name: 'orange', dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { name: 'rose', dot: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { name: 'indigo', dot: 'bg-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { name: 'teal', dot: 'bg-teal-500', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  { name: 'fuchsia', dot: 'bg-fuchsia-500', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
  { name: 'lime', dot: 'bg-lime-500', text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' },
]

function getProjectColor(index: number) {
  return PROJECT_COLORS[index % PROJECT_COLORS.length]
}

// ── Timeline event type styling ──────────────────────────────

const EVENT_TYPE_CONFIG: Record<string, { label: string; dot: string }> = {
  milestone: { label: '里程碑', dot: 'bg-primary' },
  progress: { label: '进展', dot: 'bg-blue-500' },
  blocker: { label: '阻碍', dot: 'bg-red-500' },
  decision: { label: '决策', dot: 'bg-amber-500' },
  note: { label: '备注', dot: 'bg-gray-500' },
}

// ── Components ───────────────────────────────────────────────

function ProjectSelector({
  projects,
  selectedSlugs,
  onToggle,
}: {
  projects: ReturnType<typeof getAllProjects>
  selectedSlugs: Set<string>
  onToggle: (slug: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {projects.map((p, idx) => {
        const color = getProjectColor(idx)
        const isSelected = selectedSlugs.has(p.slug)
        const StatusIcon = STATUS_CONFIG[p.status]?.icon ?? Circle
        return (
          <button
            key={p.slug}
            onClick={() => onToggle(p.slug)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              isSelected
                ? cn(color.bg, color.border, color.text)
                : 'border-border bg-card/50 text-dim hover:bg-muted hover:text-heading',
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', isSelected ? color.dot : 'bg-placeholder')} />
            <StatusIcon className={cn('h-3 w-3', isSelected ? color.text : STATUS_CONFIG[p.status]?.color)} />
            {p.title}
          </button>
        )
      })}
    </div>
  )
}

function ChronologyTimeline({ events }: { events: FlattenedEvent[] }) {
  // Group by date
  const grouped = new Map<string, FlattenedEvent[]>()
  for (const ev of events) {
    const day = ev.date.slice(0, 10)
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(ev)
  }

  const sortedDays = [...grouped.keys()].sort((a, b) => b.localeCompare(a))

  if (sortedDays.length === 0) {
    return (
      <div className="py-16 text-center">
        <Calendar className="mx-auto h-10 w-10 text-placeholder" />
        <p className="mt-3 text-sm text-dim">
          选择上方项目标签，查看时间线。
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-6">
        {sortedDays.map((day) => {
          const dayEvents = grouped.get(day)!
          const date = new Date(day)
          const dateLabel = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })

          return (
            <div key={day} className="relative pl-7">
              {/* Date header with dot */}
              <div className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="h-3 w-3 rounded-full border-2 border-background bg-primary" />
              </div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-dim">
                {dateLabel}
              </div>

              {/* Events for this day */}
              <div className="space-y-2">
                {dayEvents.map((ev, i) => {
                  const evConfig = EVENT_TYPE_CONFIG[ev.type] ?? EVENT_TYPE_CONFIG.progress
                  return (
                    <div
                      key={`${ev.projectSlug}-${i}`}
                      className="lo-card rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
                            evConfig.dot,
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-heading">{ev.title}</span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                ev.projectColor.bg,
                                ev.projectColor.text,
                              )}
                            >
                              {ev.projectName}
                            </span>
                            <span className="text-[10px] text-placeholder">
                              {evConfig.label}
                            </span>
                          </div>
                          {ev.description && (
                            <p className="mt-1 text-sm text-body">{ev.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  color,
  onToggle,
  isSelected,
}: {
  project: ReturnType<typeof getAllProjects>[number]
  color: (typeof PROJECT_COLORS)[number]
  onToggle: () => void
  isSelected: boolean
}) {
  const StatusIcon = STATUS_CONFIG[project.status]?.icon ?? Circle
  const eventCount = project.timeline?.length ?? 0

  return (
    <div
      className={cn(
        'lo-card rounded-lg p-4 transition-colors',
        isSelected && cn(color.bg, color.border),
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', color.dot)} />
            <h3 className="truncate text-sm font-semibold text-heading">{project.title}</h3>
          </div>
          {project.summary && (
            <p className="mt-1.5 line-clamp-2 text-xs text-body">{project.summary}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-dim">
            <span className={cn('inline-flex items-center gap-1', STATUS_CONFIG[project.status]?.color)}>
              <StatusIcon className="h-3 w-3" />
              {STATUS_CONFIG[project.status]?.label ?? project.status}
            </span>
            {project.startDate && (
              <span className="font-mono">
                {project.startDate.slice(0, 10)}
                {project.endDate ? ` → ${project.endDate.slice(0, 10)}` : ' → 至今'}
              </span>
            )}
            <span>{eventCount} 个事件</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'flex-shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
            isSelected
              ? cn(color.border, color.text)
              : 'border-border text-dim hover:bg-muted hover:text-heading',
          )}
        >
          {isSelected ? '✓ 已选' : '选择'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────

export function ProjectsPage() {
  const allProjects = getAllProjects()
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(
    () => new Set(allProjects.length > 0 ? [allProjects[0].slug] : []),
  )

  const toggleProject = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedSlugs(new Set(allProjects.map((p) => p.slug)))
  }

  const selectNone = () => {
    setSelectedSlugs(new Set())
  }

  // Flatten timeline events from selected projects
  const flattenedEvents: FlattenedEvent[] = allProjects.flatMap((project, idx) => {
    if (!selectedSlugs.has(project.slug)) return []
    const color = getProjectColor(idx)
    return (project.timeline ?? []).map((ev): FlattenedEvent => ({
      ...ev,
      projectName: project.title,
      projectSlug: project.slug,
      projectColor: color,
    }))
  })

  // Sort by date descending (most recent first)
  flattenedEvents.sort((a, b) => b.date.localeCompare(a.date))

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h1 className="lo-section-title">Projects</h1>
        </div>
        <p className="lo-section-desc">
          所有项目的 chronology 时间线。选择一个或多个项目，按时间线查看关键事件。
        </p>
      </header>

      {/* Project selector tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-dim">
            项目筛选（{selectedSlugs.size}/{allProjects.length}）
          </span>
          <div className="flex gap-2 text-xs">
            <button onClick={selectAll} className="text-dim transition-colors hover:text-primary">
              全选
            </button>
            <span className="text-placeholder">|</span>
            <button onClick={selectNone} className="text-dim transition-colors hover:text-primary">
              清空
            </button>
          </div>
        </div>
        <ProjectSelector
          projects={allProjects}
          selectedSlugs={selectedSlugs}
          onToggle={toggleProject}
        />
      </div>

      {/* Two-column layout: project cards + timeline */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left: Project overview cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
            项目概览
          </h2>
          {allProjects.length === 0 ? (
            <p className="text-sm text-dim">还没有项目。</p>
          ) : (
            allProjects.map((p, idx) => (
              <ProjectCard
                key={p.slug}
                project={p}
                color={getProjectColor(idx)}
                onToggle={() => toggleProject(p.slug)}
                isSelected={selectedSlugs.has(p.slug)}
              />
            ))
          )}
        </div>

        {/* Right: Chronology timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
              时间线
            </h2>
            <span className="text-[11px] text-placeholder">
              {flattenedEvents.length} 个事件 · 按时间倒序
            </span>
          </div>
          <ChronologyTimeline events={flattenedEvents} />
        </div>
      </div>
    </section>
  )
}
