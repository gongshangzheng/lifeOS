import {
  daily,
  weekly,
  monthly,
  quarterly,
  annual,
  vision,
  appendix,
  projects,
  resume,
  type daily as Daily,
  type weekly as Weekly,
  type monthly as Monthly,
  type quarterly as Quarterly,
  type annual as Annual,
  type vision as Vision,
  type appendix as Appendix,
  type projects as Projects,
  type resume as Resume,
} from './.velite'

const byDateDesc = <T extends { date?: string | undefined }>(a: T, b: T) => {
  const da = a.date ?? ''
  const db = b.date ?? ''
  return db.localeCompare(da)
}

const findBySlug = <T extends { slug: string }>(items: readonly T[], slug: string) =>
  items.find((it) => it.slug === slug)

export type { Daily, Weekly, Monthly, Quarterly, Annual, Vision, Appendix, Projects, Resume }

export const getAllDaily = (): Daily[] => [...daily].sort(byDateDesc)
export const getDailyBySlug = (slug: string): Daily | undefined => findBySlug(daily, slug)

export const getAllWeekly = (): Weekly[] => [...weekly].sort(byDateDesc)
export const getWeeklyBySlug = (slug: string): Weekly | undefined => findBySlug(weekly, slug)

export const getAllMonthly = (): Monthly[] => [...monthly].sort(byDateDesc)
export const getMonthlyBySlug = (slug: string): Monthly | undefined => findBySlug(monthly, slug)

export const getAllQuarterly = (): Quarterly[] => [...quarterly].sort(byDateDesc)
export const getQuarterlyBySlug = (slug: string): Quarterly | undefined =>
  findBySlug(quarterly, slug)

export const getAllAnnual = (): Annual[] => [...annual].sort(byDateDesc)
export const getAnnualBySlug = (slug: string): Annual | undefined => findBySlug(annual, slug)

export const getAllVision = (): Vision[] => [...vision].sort(byDateDesc)
export const getVisionBySlug = (slug: string): Vision | undefined => findBySlug(vision, slug)

export const getAllAppendix = (): Appendix[] => [...appendix].sort(byDateDesc)
export const getAppendixBySlug = (slug: string): Appendix | undefined =>
  findBySlug(appendix, slug)

// ── Projects ─────────────────────────────────────────────────
// Projects use a richer schema with status, timeline, tags, etc.
const byStartDateDesc = <T extends { startDate?: string | undefined }>(a: T, b: T) => {
  const da = a.startDate ?? ''
  const db = b.startDate ?? ''
  return db.localeCompare(da)
}

export const getAllProjects = (): Projects[] => [...projects].sort(byStartDateDesc)
export const getProjectBySlug = (slug: string): Projects | undefined =>
  findBySlug(projects, slug)

// ── Project Task Trees ───────────────────────────────────────
// Task trees live alongside project READMEs in content/projects/{slug}/tasks.json.
// A Vite plugin (projectTasksPlugin) serves them at /{slug}.tasks.json during dev
// and copies them to dist/ during production build.

export type TaskStatus = 'active' | 'completed' | 'planned' | 'blocked' | 'paused'

export type ReportLevel = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export interface RecurringConfig {
  pattern: 'daily' | 'weekly' | 'every-N-days'
  every?: number
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  activeFrom?: string
  activeUntil?: string | null
  excludeDates?: string[]
  /** Which report levels should this recurring task appear in */
  reportLevels: ReportLevel[]
}

export interface TaskNode {
  id: string
  title: string
  status: TaskStatus
  assignee?: string
  startDate?: string | null
  endDate?: string | null
  /** Simple inline description text (shown when no notePath is set) */
  description?: string
  /** Path to a markdown note file, relative to project folder (e.g. "notes/task-detail.md") */
  notePath?: string
  /** Recurring task configuration — when set, this task repeats on a schedule */
  recurring?: RecurringConfig
  /** Habit tags for daily report tracking (e.g. ["健身", "阅读"]) */
  tags?: string[]
  children: TaskNode[]
}

export interface TaskTree {
  project: string
  tasks: TaskNode[]
}

/**
 * Cascade completion: if all children are completed, mark parent as completed.
 * Recursively processes from leaf nodes upward.
 */
function cascadeStatus(tasks: TaskNode[]): TaskNode[] {
  return tasks.map((t) => {
    if (t.children.length === 0) return t
    const children = cascadeStatus(t.children)
    const allCompleted = children.every((c) => c.status === 'completed')
    return {
      ...t,
      children,
      status: allCompleted ? 'completed' as TaskStatus : t.status,
    }
  })
}

export async function getProjectTasks(slug: string): Promise<TaskTree | null> {
  try {
    const res = await fetch(`/lifeOS/${slug}.tasks.json`, { cache: 'no-cache' })
    if (!res.ok) return null
    const tree: TaskTree = await res.json()
    return { ...tree, tasks: cascadeStatus(tree.tasks) }
  } catch {
    return null
  }
}

/** Recursively count tasks in a tree */
export function countTasks(tasks: TaskNode[]): { total: number; completed: number } {
  let total = 0
  let completed = 0
  for (const t of tasks) {
    total++
    if (t.status === 'completed') completed++
    if (t.children.length > 0) {
      const sub = countTasks(t.children)
      total += sub.total
      completed += sub.completed
    }
  }
  return { total, completed }
}

/** Flatten leaf tasks with date ranges for calendar display (excludes parent/container tasks) */
export function flattenDatedTasks(
  tasks: TaskNode[],
  projectSlug: string,
): Array<TaskNode & { projectSlug: string }> {
  const result: Array<TaskNode & { projectSlug: string }> = []
  for (const t of tasks) {
    if (t.startDate && t.children.length === 0) result.push({ ...t, projectSlug })
    if (t.children.length > 0) {
      result.push(...flattenDatedTasks(t.children, projectSlug))
    }
  }
  return result
}

/** Flatten undated leaf tasks (no startDate, not completed) for sidebar display */
export function flattenUndatedTasks(
  tasks: TaskNode[],
  projectSlug: string,
): Array<TaskNode & { projectSlug: string }> {
  const result: Array<TaskNode & { projectSlug: string }> = []
  for (const t of tasks) {
    if (!t.startDate && t.status !== 'completed' && t.children.length === 0) {
      result.push({ ...t, projectSlug })
    }
    if (t.children.length > 0) {
      result.push(...flattenUndatedTasks(t.children, projectSlug))
    }
  }
  return result
}

/** Find all recurring tasks in a tree (recursive) */
export function findRecurringTasks(
  tasks: TaskNode[],
  projectSlug: string,
): Array<TaskNode & { projectSlug: string }> {
  const result: Array<TaskNode & { projectSlug: string }> = []
  for (const t of tasks) {
    if (t.recurring) result.push({ ...t, projectSlug })
    if (t.children.length > 0) {
      result.push(...findRecurringTasks(t.children, projectSlug))
    }
  }
  return result
}

/** Flatten all leaf tasks (any status, any date) for report generation */
export function flattenAllLeafTasks(
  tasks: TaskNode[],
  projectSlug: string,
): Array<TaskNode & { projectSlug: string }> {
  const result: Array<TaskNode & { projectSlug: string }> = []
  for (const t of tasks) {
    if (t.children.length === 0) {
      result.push({ ...t, projectSlug })
    } else {
      result.push(...flattenAllLeafTasks(t.children, projectSlug))
    }
  }
  return result
}

export const getResume = (): Resume | undefined => resume[0]
