#!/usr/bin/env node
// ============================================================
// lifeOS Report Generator — 从模板生成日报/周报/月报/季报
// ============================================================
// Usage:
//   node scripts/generate-report.mjs daily [--date YYYY-MM-DD]
//   node scripts/generate-report.mjs weekly [--date YYYY-MM-DD]
//   node scripts/generate-report.mjs monthly [--date YYYY-MM]
//   node scripts/generate-report.mjs quarterly [--date YYYY-QN]
// ============================================================

import { writeFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = resolve(__dirname, '../apps/web/content')
const EVENTS_FILE = resolve(__dirname, '../apps/web/public/events.json')
const PROJECTS_DIR = join(CONTENT_DIR, 'projects')

// ── Recurring task expansion ─────────────────────────────────

function loadEventsData() {
  try {
    return JSON.parse(readFileSync(EVENTS_FILE, 'utf-8'))
  } catch {
    return { events: [], recurring: [], categories: {} }
  }
}

function expandRecurringForDate(dateStr) {
  const data = loadEventsData()
  if (!data.recurring || data.recurring.length === 0) return []
  const result = []
  const weekdayNames = ['日','一','二','三','四','五','六']
  for (const r of data.recurring) {
    if (r.activeFrom && r.activeFrom > dateStr) continue
    if (r.activeUntil && r.activeUntil < dateStr) continue
    if ((r.excludeDates || []).includes(dateStr)) continue
    // Check pattern match for non-daily patterns
    if (r.pattern !== 'daily' && r.activeFrom) {
      const from = new Date(r.activeFrom + 'T00:00:00')
      const target = new Date(dateStr + 'T00:00:00')
      const diffDays = Math.round((target - from) / 86400000)
      if (r.pattern === 'weekly' && diffDays % 7 !== 0) continue
      if (r.pattern === 'every-N-days' && diffDays % (r.every || 3) !== 0) continue
    }
    const weekday = weekdayNames[new Date(dateStr + 'T00:00:00').getDay()]
    result.push({
      ...r,
      date: dateStr,
      weekday,
      eventId: `evt-${dateStr.replace(/-/g, '')}-${r.id}`,
    })
  }
  return result
}

function expandRecurringForRange(fromDate, toDate) {
  const data = loadEventsData()
  if (!data.recurring || data.recurring.length === 0) return []
  const result = []
  for (const r of data.recurring) {
    const start = new Date(Math.max(new Date(fromDate).getTime(), new Date(r.activeFrom).getTime()))
    const end = r.activeUntil
      ? new Date(Math.min(new Date(toDate).getTime(), new Date(r.activeUntil).getTime()))
      : new Date(toDate)
    const excludeSet = new Set(r.excludeDates || [])
    let current = new Date(start)
    while (current <= end) {
      const ds = current.toISOString().slice(0, 10)
      if (!excludeSet.has(ds)) {
        result.push({ ...r, date: ds })
      }
      if (r.pattern === 'daily') current.setDate(current.getDate() + 1)
      else if (r.pattern === 'weekly') current.setDate(current.getDate() + 7)
      else if (r.pattern === 'every-N-days') current.setDate(current.getDate() + (r.every || 3))
      else break
    }
  }
  return result
}

function formatRecurringDaily(dateStr) {
  const tasks = expandRecurringForDate(dateStr)
  if (tasks.length === 0) return ''
  const lines = tasks.map((t) => {
    const time = t.startTime && t.endTime ? t.startTime + '-' + t.endTime : t.startTime ? t.startTime : '全天'
    const desc = t.description ? ' — ' + t.description : ''
    return '- [ ] ' + time + ' ' + t.title + desc
  })
  return lines.join('\n')
}

// ── Project recurring & undated tasks ────────────────────────

function loadAllProjectTrees() {
  const trees = []
  try {
    const dirs = readdirSync(PROJECTS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
    for (const slug of dirs) {
      const tasksPath = join(PROJECTS_DIR, slug, 'tasks.json')
      if (existsSync(tasksPath)) {
        try {
          trees.push({ slug, tree: JSON.parse(readFileSync(tasksPath, 'utf-8')) })
        } catch { /* skip invalid */ }
      }
    }
  } catch { /* skip */ }
  return trees
}

function findProjectRecurring(reportLevel) {
  const trees = loadAllProjectTrees()
  const result = []
  for (const { slug, tree } of trees) {
    const tasks = tree.tasks || []
    ;(function find(nodes) {
      for (const t of nodes) {
        if (t.recurring && t.recurring.reportLevels && t.recurring.reportLevels.includes(reportLevel)) {
          result.push({ ...t, projectSlug: slug })
        }
        if (t.children && t.children.length > 0) find(t.children)
      }
    })(tasks)
  }
  return result
}

function findUndatedTasks() {
  const trees = loadAllProjectTrees()
  const result = []
  for (const { slug, tree } of trees) {
    const tasks = tree.tasks || []
    ;(function find(nodes) {
      for (const t of nodes) {
        if (
          t.children.length === 0 &&
          !t.startDate &&
          t.status !== 'completed'
        ) {
          result.push({ ...t, projectSlug: slug })
        }
        if (t.children && t.children.length > 0) find(t.children)
      }
    })(tasks)
  }
  return result
}

function formatProjectRecurring(reportLevel) {
  const tasks = findProjectRecurring(reportLevel)
  if (tasks.length === 0) return ''
  const weekdayNames = ['日','一','二','三','四','五','六']
  const lines = tasks.map((t) => {
    const r = t.recurring
    const freq = r.pattern === 'daily'
      ? '每日'
      : r.pattern === 'weekly'
        ? '每周' + weekdayNames[new Date(r.activeFrom + 'T00:00:00').getDay()]
        : '每' + (r.every || 3) + '天'
    const time = r.startTime ? r.startTime + (r.endTime ? '-' + r.endTime : '') + ' ' : ''
    const desc = t.description ? ' — ' + t.description : ''
    return '- [ ] ' + time + t.title + ' (' + freq + ', ' + t.projectSlug + ')' + desc
  })
  return lines.join('\n')
}

/** Find project recurring tasks that match a specific date */
function findProjectRecurringForDate(dateStr) {
  const tasks = findProjectRecurring('daily')
  const result = []
  for (const t of tasks) {
    const r = t.recurring
    if (r.activeFrom && r.activeFrom > dateStr) continue
    if (r.activeUntil && r.activeUntil < dateStr) continue
    if ((r.excludeDates || []).includes(dateStr)) continue
    if (r.pattern !== 'daily' && r.activeFrom) {
      const from = new Date(r.activeFrom + 'T00:00:00')
      const target = new Date(dateStr + 'T00:00:00')
      const diffDays = Math.round((target - from) / 86400000)
      if (r.pattern === 'weekly' && diffDays % 7 !== 0) continue
      if (r.pattern === 'every-N-days' && diffDays % (r.every || 3) !== 0) continue
    }
    result.push(t)
  }
  return result
}

function formatProjectRecurringDaily(dateStr) {
  const tasks = findProjectRecurringForDate(dateStr)
  if (tasks.length === 0) return ''
  const lines = tasks.map((t) => {
    const r = t.recurring
    const time = r.startTime && r.endTime ? r.startTime + '-' + r.endTime : r.startTime ? r.startTime : '全天'
    const loc = r.location ? ' @' + r.location : ''
    const desc = t.description ? ' — ' + t.description : ''
    return '- [ ] ' + time + ' ' + t.title + loc + desc
  })
  return lines.join('\n')
}

function formatUndatedTasks() {
  const tasks = findUndatedTasks()
  if (tasks.length === 0) return ''
  const lines = tasks.map((t) => {
    const desc = t.description ? ' — ' + t.description : ''
    return '- [ ] ' + t.title + ' (' + t.projectSlug + ', ' + t.status + ')' + desc
  })
  return lines.join('\n')
}

// ── Habit tasks ──────────────────────────────────────────────

function findHabitTasks() {
  const trees = loadAllProjectTrees()
  const result = []
  for (const { slug, tree } of trees) {
    const tasks = tree.tasks || []
    ;(function find(nodes) {
      for (const t of nodes) {
        if (t.tags && t.tags.length > 0 && t.status !== 'completed') {
          result.push({ title: t.title, tag: t.tags[0], projectSlug: slug })
        }
        if (t.children && t.children.length > 0) find(t.children)
      }
    })(tasks)
  }
  return result
}

function formatHabitTasks() {
  const tasks = findHabitTasks()
  if (tasks.length === 0) return ''
  const lines = tasks.map((t) => '- [ ] ' + t.title + ' #' + t.tag)
  return lines.join('\n')
}

function formatRecurringWeekly(fromDate, toDate) {
  const tasks = expandRecurringForRange(fromDate, toDate)
  if (tasks.length === 0) return ''
  // Group by recurring id (unique task)
  const byId = new Map()
  for (const t of tasks) {
    if (!byId.has(t.id)) byId.set(t.id, { ...t, dates: [] })
    byId.get(t.id).dates.push(t.date)
  }
  const weekdayNames = ['日','一','二','三','四','五','六']
  const lines = [...byId.values()].map((t) => {
    const freq = t.pattern === 'daily'
      ? '每日'
      : t.pattern === 'weekly'
        ? '每周' + weekdayNames[new Date(t.activeFrom + 'T00:00:00').getDay()]
        : '每' + (t.every || 3) + '天'
    const count = t.dates.length
    const desc = t.description ? ' — ' + t.description : ''
    return '- [ ] ' + t.title + ' (' + freq + ', 本周' + count + '次)' + desc
  })
  return lines.join('\n')
}

function formatRecurringMonthly(monthStr) {
  const fromDate = `${monthStr}-01`
  const [y, m] = monthStr.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const toDate = `${monthStr}-${pad(lastDay)}`
  const tasks = expandRecurringForRange(fromDate, toDate)
  if (tasks.length === 0) return ''
  const byId = new Map()
  for (const t of tasks) {
    if (!byId.has(t.id)) byId.set(t.id, { ...t, count: 0 })
    byId.get(t.id).count++
  }
  const weekdayNames = ['日','一','二','三','四','五','六']
  const lines = [...byId.values()].map((t) => {
    const freq = t.pattern === 'daily'
      ? '每日'
      : t.pattern === 'weekly'
        ? '每周' + weekdayNames[new Date(t.activeFrom + 'T00:00:00').getDay()]
        : '每' + (t.every || 3) + '天'
    const desc = t.description ? ' — ' + t.description : ''
    return '- [ ] ' + t.title + ' (' + freq + ', 本月' + t.count + '次)' + desc
  })
  return lines.join('\n')
}

const DIRS = {
  daily: join(CONTENT_DIR, '6-daily'),
  weekly: join(CONTENT_DIR, '5-weekly'),
  monthly: join(CONTENT_DIR, '4-monthly'),
  quarterly: join(CONTENT_DIR, '3-quarterly'),
}

// ── Helpers ──────────────────────────────────────────────────

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
}

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

function getWeekdayCN(d) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}

function parseArgs(args) {
  const result = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      result.date = args[++i]
    }
  }
  return result
}

// ── Generators ───────────────────────────────────────────────

function generateDaily(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date()
  const dateStr_ = fmtDate(date)
  const weekday = getWeekdayCN(date)
  const weekNum = getWeekNumber(date)
  const monthStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
  const weekSlug = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-W${pad(weekNum)}`

  // Prev/next day
  const prev = new Date(date)
  prev.setDate(prev.getDate() - 1)
  const next = new Date(date)
  next.setDate(next.getDate() + 1)

  const title = `日报 - ${dateStr_} ${weekday}`
  const summary = `上层： [${monthStr} 月报](../4-monthly/${monthStr}.md) ｜ [${weekSlug} 周报](../5-weekly/${weekSlug}.md) 同层连续： [前一天日报](../6-daily/${fmtDate(prev)}.md) ｜ [后一天日报](../6-daily/${fmtDate(next)}.md)`

  const recurringSection = formatRecurringDaily(dateStr_)
  const projectRecurring = formatProjectRecurringDaily(dateStr_)
  const undatedSection = formatUndatedTasks()
  const habitSection = formatHabitTasks()

  // Build recurring tasks section (events.json + project recurring)
  const recurringParts = [recurringSection, projectRecurring].filter(Boolean)
  const recurringBlock = recurringParts.length > 0
    ? '\n---\n\n## 定期任务\n\n' + recurringParts.join('\n') + '\n'
    : ''

  // Build undated tasks section
  const undatedBlock = undatedSection
    ? '\n---\n\n## 待安排\n\n' + undatedSection + '\n'
    : ''

  // Build habit tracking section
  const habitBlock = habitSection
    ? '\n---\n\n## 习惯打卡\n\n' + habitSection + '\n'
    : ''

  const content = `---
title: "${title}"
slug: "${dateStr_}"
type: daily
date: ${dateStr_}
summary: "${summary}"
tags:
  - daily
  - report
  - ${monthStr}
---

# ${title}


> 上层： [${monthStr} 月报](../4-monthly/${monthStr}.md) ｜ [${weekSlug} 周报](../5-weekly/${weekSlug}.md)
> 同层连续： [前一天日报](../6-daily/${fmtDate(prev)}.md) ｜ [后一天日报](../6-daily/${fmtDate(next)}.md)

---

## 今日优先

| 事项 | 优先级 | 日历 | 状态 |
|------|--------|------|------|
|      | P0     |      |      |

---

## 时间安排

| 时间 | 事项 | 日历 | 说明 |
|------|------|------|------|
|      |      |      |      |${habitBlock}${recurringBlock}${undatedBlock}
---

## 规划

### 今日目标

- [ ] 

### 备注

- 

---

## 进展记录



---

## 总结

### 完成事项

- [ ] 

### 未完成 & 原因

- 

### 今日收获

- 

### 明日待跟进

- [ ] 

---

## 日记

-
`

  return {
    path: join(DIRS.daily, `${dateStr_}.md`),
    content,
    title,
  }
}

function generateWeekly(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date()
  const monday = getMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)

  const weekNum = getWeekNumber(monday)
  const monthStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}`
  const weekSlug = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-W${pad(weekNum)}`

  const quarterNum = Math.ceil((monday.getMonth() + 1) / 3)
  const quarterStr = `${monday.getFullYear()}-Q${quarterNum}`

  const mondayStr = `${pad(monday.getMonth() + 1)}.${pad(monday.getDate())}`
  const sundayStr = `${pad(sunday.getMonth() + 1)}.${pad(sunday.getDate())}`

  const title = `周报 - ${monday.getFullYear()}年${monday.getMonth() + 1}月第${weekNum}周 (${mondayStr} - ${sundayStr})`
  const summary = `上层： [${monthStr} 月报](../4-monthly/${monthStr}.md) ｜ [${quarterStr} 季报](../3-quarterly/${quarterStr}.md)`

  // Build recurring + undated sections for weekly
  const weeklyRecurring = formatRecurringWeekly(fmtDate(monday), fmtDate(sunday))
  const weeklyProjectRecurring = formatProjectRecurring('weekly')
  const recurringParts = [weeklyRecurring, weeklyProjectRecurring].filter(Boolean)
  const recurringBlock = recurringParts.length > 0
    ? '\n---\n\n## 定期任务\n\n' + recurringParts.join('\n') + '\n'
    : ''
  const undatedSection = formatUndatedTasks()
  const undatedBlock = undatedSection
    ? '\n---\n\n## 待安排\n\n' + undatedSection + '\n'
    : ''

  const content = `---
title: "${title}"
slug: "${weekSlug}"
type: weekly
date: ${fmtDate(monday)}
summary: "${summary}"
tags:
  - weekly
  - plan
  - ${monthStr}
weekNumber: ${weekNum}
---

# ${title}


> 上层： [${monthStr} 月报](../4-monthly/${monthStr}.md) ｜ [${quarterStr} 季报](../3-quarterly/${quarterStr}.md)

## 本周主题



## 本周核心目标

1. 
2. 
3. 

## 本周重点任务

### 工作/实习
- [ ] 

### 学习/成长
- [ ] 

### 生活/健康
- [ ] 

### 社交/感情
- [ ] ${recurringBlock}${undatedBlock}
`

  return {
    path: join(DIRS.weekly, `${weekSlug}.md`),
    content,
    title,
  }
}

function generateMonthly(dateStr) {
  const date = dateStr ? new Date(dateStr + '-01') : new Date()
  const monthStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
  const quarterNum = Math.ceil((date.getMonth() + 1) / 3)
  const quarterStr = `${date.getFullYear()}-Q${quarterNum}`

  const title = `月报 - ${date.getFullYear()}年${date.getMonth() + 1}月`
  const summary = `上层： [${quarterStr} 季报](../3-quarterly/${quarterStr}.md) ｜ [${date.getFullYear()} 年报](../2-annual/${date.getFullYear()}.md)`

  // Build recurring + undated sections for monthly
  const monthlyRecurring = formatRecurringMonthly(monthStr)
  const monthlyProjectRecurring = formatProjectRecurring('monthly')
  const recurringParts = [monthlyRecurring, monthlyProjectRecurring].filter(Boolean)
  const recurringBlock = recurringParts.length > 0
    ? '\n---\n\n## 定期任务\n\n' + recurringParts.join('\n') + '\n'
    : ''
  const undatedSection = formatUndatedTasks()
  const undatedBlock = undatedSection
    ? '\n---\n\n## 待安排\n\n' + undatedSection + '\n'
    : ''

  const content = `---
title: "${title}"
slug: "${monthStr}"
type: monthly
date: ${monthStr}-01
summary: "${summary}"
tags:
  - monthly
  - report
  - ${monthStr}
---

# ${title}


> 上层： [${quarterStr} 季报](../3-quarterly/${quarterStr}.md) ｜ [${date.getFullYear()} 年报](../2-annual/${date.getFullYear()}.md)

## 本月主题



## 月度计划

### 核心方向
- [ ] 
- [ ] 

### 阶段划分
- [ ] 上旬：
- [ ] 中旬：
- [ ] 下旬：${recurringBlock}${undatedBlock}
## 关键数据

| 维度 | 目标 | 实际 |
|------|------|------|
|      |      |      |

## 月度反思

-
`

  return {
    path: join(DIRS.monthly, `${monthStr}.md`),
    content,
    title,
  }
}

function generateQuarterly(dateStr) {
  let year, quarterNum
  if (dateStr) {
    const m = dateStr.match(/^(\d{4})-Q(\d)$/)
    if (!m) { console.error('季报日期格式: YYYY-QN'); process.exit(1) }
    year = parseInt(m[1])
    quarterNum = parseInt(m[2])
  } else {
    const now = new Date()
    year = now.getFullYear()
    quarterNum = Math.ceil((now.getMonth() + 1) / 3)
  }
  const quarterStr = `${year}-Q${quarterNum}`
  const startMonth = (quarterNum - 1) * 3 + 1
  const endMonth = startMonth + 2

  const title = `季报 - ${year}年${quarterStr.slice(-2)}（${startMonth}-${endMonth}月）`
  const summary = `上层： [${year} 年报](../2-annual/${year}.md) ｜ [五年计划](../1-vision/five-year-2026-2030.md)`

  const content = `---
title: "${title}"
slug: "${quarterStr}"
type: quarterly
date: ${year}-${pad(startMonth)}-01
summary: "${summary}"
tags:
  - quarterly
  - report
  - ${quarterStr}
quarter: ${quarterStr.slice(-2)}
---

# ${title}


> 上层： [${year} 年报](../2-annual/${year}.md) ｜ [五年计划](../1-vision/five-year-2026-2030.md)

---

## 本季度核心目标

- [ ] 
- [ ] 
- [ ] 

---

## 各维度进展

| 维度 | 目标 | 状态 | 趋势 | 完成度 |
|------|------|------|------|--------|
|      |      |      |      |        |

---

## 季度反思

- 做得好的：
- 需要改进的：
- 季度感悟：

## 下季度计划

- [ ] 
- [ ] 
- [ ] 
`

  return {
    path: join(DIRS.quarterly, `${quarterStr}.md`),
    content,
    title,
  }
}

// ── Main ─────────────────────────────────────────────────────

const [type, ...rest] = process.argv.slice(2)
const opts = parseArgs(rest)

const generators = {
  daily: () => generateDaily(opts.date),
  weekly: () => generateWeekly(opts.date),
  monthly: () => generateMonthly(opts.date),
  quarterly: () => generateQuarterly(opts.date),
}

if (!type || !generators[type]) {
  console.error('Usage: node scripts/generate-report.mjs <daily|weekly|monthly|quarterly> [--date YYYY-MM-DD]')
  console.error('')
  console.error('  daily     [--date YYYY-MM-DD]   默认今天')
  console.error('  weekly    [--date YYYY-MM-DD]   默认本周')
  console.error('  monthly   [--date YYYY-MM]      默认本月')
  console.error('  quarterly [--date YYYY-QN]      默认本季')
  process.exit(1)
}

const result = generators[type]()

// Ensure directory exists
const dir = dirname(result.path)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

// Check if file already exists
if (existsSync(result.path)) {
  console.error(`文件已存在: ${result.path}`)
  process.exit(1)
}

writeFileSync(result.path, result.content, 'utf-8')
console.log(`已创建: ${result.path}`)
console.log(`标题: ${result.title}`)
