import { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {
  CheckCircle2,
  Pause,
  Circle,
  GitBranch,
  ChevronRight,
  ChevronDown,
  User,
  FileText,
  ArrowLeft,
  Clock,
  MapPin,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAllProjects,
  getProjectTasks,
  countTasks,
  type TaskNode,
  type TaskTree,
  type Projects,
} from '@/content/loader'

// ── Status config ────────────────────────────────────────────

const TASK_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; ring: string }
> = {
  active: { label: '进行中', dot: 'bg-green-500', ring: 'ring-green-500/30' },
  completed: { label: '已完成', dot: 'bg-blue-500', ring: 'ring-blue-500/30' },
  planned: { label: '规划中', dot: 'bg-zinc-400', ring: 'ring-zinc-400/30' },
  blocked: { label: '阻塞', dot: 'bg-red-500', ring: 'ring-red-500/30' },
  paused: { label: '已暂停', dot: 'bg-amber-500', ring: 'ring-amber-500/30' },
}

const PROJECT_STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Circle; color: string }
> = {
  active: { label: '进行中', icon: GitBranch, color: 'text-green-400' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'text-blue-400' },
  paused: { label: '已暂停', icon: Pause, color: 'text-amber-400' },
  planned: { label: '规划中', icon: Circle, color: 'text-dim' },
}

// ── Project colors ───────────────────────────────────────────

const PROJECT_COLORS = [
  { name: 'emerald', dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', line: 'bg-emerald-500/50' },
  { name: 'blue', dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', line: 'bg-blue-500/50' },
  { name: 'amber', dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', line: 'bg-amber-500/50' },
  { name: 'violet', dot: 'bg-violet-500', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', line: 'bg-violet-500/50' },
  { name: 'pink', dot: 'bg-pink-500', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', line: 'bg-pink-500/50' },
  { name: 'cyan', dot: 'bg-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', line: 'bg-cyan-500/50' },
]

function getProjectColor(index: number) {
  return PROJECT_COLORS[index % PROJECT_COLORS.length]
}

// ── Status legend tooltip ────────────────────────────────────

function StatusLegend() {
  return (
    <div className="group/help relative flex-shrink-0">
      <HelpCircle className="h-3.5 w-3.5 cursor-help text-placeholder transition-colors group-hover/help:text-dim" />
      <div className="invisible absolute right-0 top-full z-50 mt-1 w-60 rounded-lg border border-border bg-card p-3 opacity-0 shadow-xl transition-all group-hover/help:visible group-hover/help:opacity-100">
        <h4 className="mb-2 text-xs font-semibold text-heading">任务状态说明</h4>
        <ul className="space-y-1.5">
          {Object.entries(TASK_STATUS_CONFIG).map(([key, cfg]) => (
            <li key={key} className="flex items-center gap-2 text-[11px] text-body">
              <span className={cn('h-2 w-2 flex-shrink-0 rounded-full ring-2', cfg.dot, cfg.ring)} />
              <span className="font-medium">{cfg.label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2.5 border-t border-border pt-2">
          <p className="text-[10px] leading-relaxed text-dim">
            圆点颜色表示任务的执行状态；分支线颜色对应所属项目。
          </p>
        </div>
      </div>
    </div>
  )
}

// ── TaskTreeNode ─────────────────────────────────────────────

function TaskTreeNode({
  task,
  depth,
  isLast,
  parentLines,
  projectColor,
  selectedId,
  onSelect,
}: {
  task: TaskNode
  depth: number
  isLast: boolean
  parentLines: boolean[]
  projectColor: (typeof PROJECT_COLORS)[number]
  selectedId: string | null
  onSelect: (task: TaskNode) => void
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const [hovered, setHovered] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasChildren = task.children.length > 0
  const statusCfg = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.planned
  const { total, completed } = hasChildren ? countTasks(task.children) : { total: 0, completed: 0 }
  const isSelected = selectedId === task.id
  const isClickable = !!(task.notePath || task.description)

  const handleEnter = () => {
    hoverTimer.current = setTimeout(() => setHovered(true), 400)
  }
  const handleLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHovered(false)
  }

  return (
    <div className="select-none">
      <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <div
          className={cn(
            'group flex items-center gap-0 rounded-sm transition-colors',
            isSelected && 'bg-primary/5',
            isClickable && !isSelected && 'hover:bg-muted/50',
            isClickable && 'cursor-pointer',
          )}
          onClick={() => isClickable && onSelect(task)}
        >
          {/* Git-style branch lines */}
          <div className="flex flex-shrink-0 items-center" style={{ width: depth * 20 + 20 }}>
            {parentLines.map((showLine, i) => (
              <div key={i} className="relative h-full w-5 flex-shrink-0">
                {showLine && (
                  <div className={cn('absolute left-2 top-0 bottom-0 w-px', projectColor.line)} />
                )}
              </div>
            ))}
            {depth > 0 && (
              <div className="relative h-7 w-5 flex-shrink-0">
                <div className={cn('absolute left-2 top-0 h-3.5 w-px', projectColor.line)} />
                <div className={cn('absolute left-2 top-3.5 h-px w-2.5', projectColor.line)} />
              </div>
            )}
          </div>

          {/* Node dot */}
          <div className="relative flex flex-shrink-0 items-center">
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full ring-2',
                statusCfg.dot,
                statusCfg.ring,
                task.status === 'completed' && 'opacity-70',
              )}
            />
          </div>

          {/* Content */}
          <div className="ml-1.5 flex min-w-0 flex-1 items-center gap-1.5 py-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(!expanded)
                }}
                className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-dim transition-colors hover:text-heading"
              >
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <span className="h-4 w-4 flex-shrink-0" />
            )}

            <span
              className={cn(
                'truncate text-[13px]',
                task.status === 'completed' ? 'text-dim line-through' : 'text-body',
                isSelected && 'font-medium text-heading',
              )}
            >
              {task.title}
            </span>

            {hasChildren && (
              <span className="flex-shrink-0 text-[10px] text-placeholder">
                {completed}/{total}
              </span>
            )}

            {task.assignee && (
              <span className="ml-auto flex flex-shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary-subtle-foreground">
                <User className="h-2.5 w-2.5" />
                {task.assignee}
              </span>
            )}

            {task.startTime && (
              <span className="flex flex-shrink-0 items-center gap-0.5 text-[10px] text-dim">
                <Clock className="h-2.5 w-2.5" />
                {task.startTime}{task.endTime ? `-${task.endTime}` : ''}
              </span>
            )}
            {!task.startTime && task.startDate && (
              <span className="flex-shrink-0 text-[10px] text-placeholder">
                {task.startDate.slice(5)}
              </span>
            )}

            {task.location && (
              <span className="flex flex-shrink-0 items-center gap-0.5 text-[10px] text-placeholder">
                <MapPin className="h-2.5 w-2.5" />
                {task.location}
              </span>
            )}

            {task.notePath && (
              <FileText className="h-3 w-3 flex-shrink-0 text-placeholder" />
            )}
          </div>
        </div>

        {/* Hover tooltip */}
        {hovered && !isSelected && (
          <div className="absolute left-8 top-full z-50 w-64 rounded-lg border border-border bg-card p-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full ring-2', statusCfg.dot, statusCfg.ring)} />
              <h3 className="text-sm font-semibold text-heading">{task.title}</h3>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-dim">
                {statusCfg.label}
              </span>
            </div>
            {task.assignee && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-dim">
                <User className="h-3 w-3" />
                执行人: {task.assignee}
              </div>
            )}
            {(task.startTime || task.startDate) && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-dim">
                <Clock className="h-3 w-3" />
                {task.startDate && task.startDate.slice(0, 10)}
                {task.startTime ? ` ${task.startTime}${task.endTime ? `-${task.endTime}` : ''}` : ''}
                {task.endDate ? ` → ${task.endDate.slice(0, 10)}` : ''}
              </div>
            )}
            {task.location && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-dim">
                <MapPin className="h-3 w-3" />
                {task.location}
              </div>
            )}
            {hasChildren && (
              <div className="mt-1.5 text-[11px] text-dim">
                子任务: {completed}/{total} 已完成
                {total > 0 && (
                  <span className="ml-1.5 inline-block h-1.5 w-12 overflow-hidden rounded-full bg-muted align-middle">
                    <span
                      className="block h-full rounded-full bg-green-500"
                      style={{ width: `${(completed / total) * 100}%` }}
                    />
                  </span>
                )}
              </div>
            )}
            {task.description && (
              <p className="mt-2 text-xs text-body">{task.description}</p>
            )}
            {task.notePath && (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-primary">
                <FileText className="h-3 w-3" />
                点击查看笔记
              </div>
            )}
            {hasChildren && (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-placeholder">子任务</span>
                {task.children.map((child) => {
                  const childCfg = TASK_STATUS_CONFIG[child.status] ?? TASK_STATUS_CONFIG.planned
                  return (
                    <div key={child.id} className="flex items-center gap-2 text-xs text-body">
                      <span className={cn('h-1.5 w-1.5 rounded-full', childCfg.dot)} />
                      <span className={child.status === 'completed' ? 'text-dim line-through' : ''}>
                        {child.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {task.children.map((child, i) => (
            <TaskTreeNode
              key={child.id}
              task={child}
              depth={depth + 1}
              isLast={i === task.children.length - 1}
              parentLines={[...parentLines, !isLast]}
              projectColor={projectColor}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Project Selector (tabs) ──────────────────────────────────

function ProjectTabs({
  projects,
  activeSlug,
  onSelect,
}: {
  projects: Projects[]
  activeSlug: string | null
  onSelect: (slug: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {projects.map((p, idx) => {
        const color = getProjectColor(idx)
        const isActive = activeSlug === p.slug
        const StatusIcon = PROJECT_STATUS_CONFIG[p.status]?.icon ?? Circle
        return (
          <button
            key={p.slug}
            onClick={() => onSelect(p.slug)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? cn(color.bg, color.border, color.text)
                : 'border-border bg-card/50 text-dim hover:bg-muted hover:text-heading',
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', isActive ? color.dot : 'bg-placeholder')} />
            <StatusIcon className={cn('h-3 w-3', isActive ? color.text : PROJECT_STATUS_CONFIG[p.status]?.color)} />
            {p.title}
          </button>
        )
      })}
    </div>
  )
}

// ── Project README renderer ──────────────────────────────────

function ProjectReadme({ project }: { project: Projects }) {
  const StatusIcon = PROJECT_STATUS_CONFIG[project.status]?.icon ?? Circle
  const colorIdx = getAllProjects().findIndex((p) => p.slug === project.slug)
  const color = getProjectColor(Math.max(0, colorIdx))

  return (
    <div>
      {/* Meta header */}
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <span className={cn('h-3 w-3 rounded-full', color.dot)} />
        <h1 className="text-xl font-bold text-heading">{project.title}</h1>
        <span className={cn('inline-flex items-center gap-1 text-xs', PROJECT_STATUS_CONFIG[project.status]?.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {PROJECT_STATUS_CONFIG[project.status]?.label ?? project.status}
        </span>
        {project.startDate && (
          <span className="font-mono text-xs text-dim">
            {project.startDate.slice(0, 10)}
            {project.endDate ? ` → ${project.endDate.slice(0, 10)}` : ' → 至今'}
          </span>
        )}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-dim"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Markdown body */}
      {project.body ? (
        <div className="md-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {project.body}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-dim">暂无 README 内容。</p>
      )}
    </div>
  )
}

// ── Task Note view ───────────────────────────────────────────

function TaskNoteView({ task, projectSlug }: { task: TaskNode; projectSlug: string }) {
  const [noteContent, setNoteContent] = useState<string | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  const statusCfg = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.planned

  useEffect(() => {
    if (!task.notePath) {
      setNoteContent(null)
      setNoteError(null)
      return
    }
    let cancelled = false
    setNoteLoading(true)
    setNoteError(null)
    fetch(`/lifeOS/projects/${projectSlug}/${task.notePath}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) {
          setNoteContent(text)
          setNoteLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setNoteError(err.message)
          setNoteLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [task.notePath, projectSlug])

  return (
    <div>
      {/* Task header */}
      <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <span className={cn('h-2.5 w-2.5 rounded-full ring-2', statusCfg.dot, statusCfg.ring)} />
        <h1 className="text-lg font-bold text-heading">{task.title}</h1>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-dim">
          {statusCfg.label}
        </span>
        {task.assignee && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary-subtle-foreground">
            <User className="h-3 w-3" />
            {task.assignee}
          </span>
        )}
        {task.startDate && (
          <span className="font-mono text-xs text-dim">
            {task.startDate.slice(0, 10)}
            {task.endDate ? ` → ${task.endDate.slice(0, 10)}` : ''}
          </span>
        )}
        {task.startTime && (
          <span className="inline-flex items-center gap-1 text-xs text-dim">
            <Clock className="h-3 w-3" />
            {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
          </span>
        )}
        {task.location && (
          <span className="inline-flex items-center gap-1 text-xs text-dim">
            <MapPin className="h-3 w-3" />
            {task.location}
          </span>
        )}
      </div>

      {/* Note content */}
      {task.notePath ? (
        noteLoading ? (
          <div className="py-8 text-center text-xs text-dim">加载笔记中…</div>
        ) : noteError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">加载失败: {noteError}</p>
            <p className="mt-1 text-xs text-dim">路径: {task.notePath}</p>
          </div>
        ) : noteContent ? (
          <div className="md-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {noteContent}
            </ReactMarkdown>
          </div>
        ) : null
      ) : task.description ? (
        <div className="text-sm text-body leading-relaxed whitespace-pre-line">
          {task.description}
        </div>
      ) : (
        <p className="text-sm text-dim">该任务暂无描述或笔记。</p>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────

export function ProjectsPage() {
  const allProjects = getAllProjects()
  const [activeSlug, setActiveSlug] = useState<string | null>(() => {
    // Read from URL hash on init, fallback to first project
    const hash = window.location.hash.slice(1)
    if (hash && allProjects.some((p) => p.slug === hash)) return hash
    return allProjects.length > 0 ? allProjects[0].slug : null
  })
  const [taskTrees, setTaskTrees] = useState<Record<string, TaskTree | null>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null)

  const loadTaskTree = useCallback(async (slug: string) => {
    if (taskTrees[slug] !== undefined || loading[slug]) return
    setLoading((prev) => ({ ...prev, [slug]: true }))
    const tree = await getProjectTasks(slug)
    setTaskTrees((prev) => ({ ...prev, [slug]: tree }))
    setLoading((prev) => ({ ...prev, [slug]: false }))
  }, [taskTrees, loading])

  // Only load the active project's task tree (not all at once)
  useEffect(() => {
    if (activeSlug) {
      loadTaskTree(activeSlug)
    }
  }, [activeSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash && allProjects.some((p) => p.slug === hash)) {
        setActiveSlug(hash)
        setSelectedTask(null)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [allProjects])

  const activeProject = allProjects.find((p) => p.slug === activeSlug) ?? null
  const activeColor = getProjectColor(allProjects.findIndex((p) => p.slug === activeSlug))
  const activeTree = activeSlug ? taskTrees[activeSlug] ?? null : null
  const isLoadingTree = activeSlug ? loading[activeSlug] ?? false : false

  const handleProjectChange = (slug: string) => {
    setActiveSlug(slug)
    setSelectedTask(null)
    loadTaskTree(slug)
    window.location.hash = slug
  }

  const handleBackToReadme = () => setSelectedTask(null)

  return (
    <section className="space-y-6">
      {/* Header + tabs */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h1 className="lo-section-title">Projects</h1>
        </div>
        <ProjectTabs
          projects={allProjects}
          activeSlug={activeSlug}
          onSelect={handleProjectChange}
        />
      </header>

      {activeProject && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left sidebar: task tree */}
          <aside className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <button
                onClick={handleBackToReadme}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-colors',
                  selectedTask
                    ? 'text-primary hover:text-primary/80'
                    : 'text-heading',
                )}
              >
                {selectedTask && <ArrowLeft className="h-3 w-3" />}
                {activeProject.title}
              </button>
              <div className="ml-auto flex items-center gap-2">
                {activeTree && (
                  <span className="text-[10px] text-placeholder">
                    {countTasks(activeTree.tasks).completed}/{countTasks(activeTree.tasks).total}
                  </span>
                )}
                <StatusLegend />
              </div>
            </div>

            {isLoadingTree ? (
              <div className="py-8 text-center text-xs text-dim">加载中…</div>
            ) : activeTree && activeTree.tasks.length > 0 ? (
              <div className="space-y-0.5">
                {activeTree.tasks.map((task, i) => (
                  <TaskTreeNode
                    key={task.id}
                    task={task}
                    depth={0}
                    isLast={i === activeTree.tasks.length - 1}
                    parentLines={[]}
                    projectColor={activeColor}
                    selectedId={selectedTask?.id ?? null}
                    onSelect={setSelectedTask}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <GitBranch className="mx-auto h-8 w-8 text-placeholder" />
                <p className="mt-2 text-xs text-dim">暂无任务树数据。</p>
              </div>
            )}
          </aside>

          {/* Center: project README or task note */}
          <main className="min-w-0">
            {selectedTask ? (
              <TaskNoteView task={selectedTask} projectSlug={activeProject.slug} />
            ) : (
              <ProjectReadme project={activeProject} />
            )}
          </main>
        </div>
      )}

      {allProjects.length === 0 && (
        <div className="py-16 text-center">
          <GitBranch className="mx-auto h-10 w-10 text-placeholder" />
          <p className="mt-3 text-sm text-dim">还没有项目。</p>
        </div>
      )}
    </section>
  )
}
