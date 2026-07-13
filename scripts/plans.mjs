#!/usr/bin/env node
// ============================================================
// lifeOS Plans CLI — 快速列出项目、日/周/月/季/年计划
// ============================================================
// Usage:
//   node scripts/plans.mjs projects [--status active|completed|paused|planned]
//   node scripts/plans.mjs daily [--date YYYY-MM-DD]
//   node scripts/plans.mjs weekly [--date YYYY-MM-DD | --week YYYY-WNN]
//   node scripts/plans.mjs monthly [--date YYYY-MM]
//   node scripts/plans.mjs quarterly [--date YYYY-QN]
//   node scripts/plans.mjs annual [--year YYYY]
//   node scripts/plans.mjs overview              — 综合概览：近期计划一览
//   node scripts/plans.mjs tasks [--project slug] — 列出项目任务树
//   node scripts/plans.mjs task-update --project slug --task-id id --status completed
//   node scripts/plans.mjs task-add --project slug --parent id --title "..." [--status active]
// ============================================================

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = resolve(__dirname, '../apps/web/content')

const DIRS = {
  vision: join(CONTENT_DIR, '1-vision'),
  annual: join(CONTENT_DIR, '2-annual'),
  quarterly: join(CONTENT_DIR, '3-quarterly'),
  monthly: join(CONTENT_DIR, '4-monthly'),
  weekly: join(CONTENT_DIR, '5-weekly'),
  daily: join(CONTENT_DIR, '6-daily'),
  projects: join(CONTENT_DIR, 'projects'),
}

// ── Helpers ──────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { meta: {}, body: content }
  const raw = match[1]
  const meta = {}
  let currentKey = null
  let inArray = false
  let arrayItems = []
  let currentObj = null

  function flushArray() {
    if (currentObj) { arrayItems.push(currentObj); currentObj = null }
    meta[currentKey] = arrayItems
    inArray = false
    arrayItems = []
  }

  const lines = raw.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Array object property continuation (e.g. "    date: 2026-06-01")
    if (inArray && currentObj && /^\s{4,}(\w[\w-]*):\s*(.*)$/.test(line)) {
      const [, k, v] = line.match(/^\s{4,}(\w[\w-]*):\s*(.*)$/)
      currentObj[k] = v === 'null' ? null : v.replace(/^["']|["']$/g, '')
      continue
    }

    // YAML array item start
    if (inArray && /^\s+-\s/.test(line)) {
      if (currentObj) { arrayItems.push(currentObj); currentObj = null }
      const val = line.replace(/^\s+-\s*/, '').trim()
      // Check if it's a key: value (object start)
      const objMatch = val.match(/^(\w[\w-]*):\s*(.*)$/)
      if (objMatch) {
        currentObj = {}
        currentObj[objMatch[1]] = objMatch[2] === 'null' ? null : objMatch[2].replace(/^["']|["']$/g, '')
      } else {
        arrayItems.push(val)
      }
      continue
    } else if (inArray) {
      flushArray()
    }

    // key: value
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (!kvMatch) continue
    const [, key, val] = kvMatch
    currentKey = key

    if (val === '' || val === undefined) {
      inArray = true
      arrayItems = []
      currentObj = null
      continue
    }

    if (val === 'null') meta[key] = null
    else if (val === 'true') meta[key] = true
    else if (val === 'false') meta[key] = false
    else if (/^\d+$/.test(val)) meta[key] = parseInt(val, 10)
    else if (/^\[.*\]$/.test(val)) {
      meta[key] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '')
    }
  }
  if (inArray) flushArray()

  const body = content.slice(match[0].length).trim()
  return { meta, body }
}

function readMdFiles(dir) {
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
    return files.map((f) => {
      const fullPath = join(dir, f)
      const content = readFileSync(fullPath, 'utf-8')
      const { meta, body } = parseFrontmatter(content)
      return { file: f, path: fullPath, meta, body }
    })
  } catch {
    return []
  }
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[key] = next
        i++
      } else {
        args[key] = true
      }
    }
  }
  return args
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function currentMonth() {
  return today().slice(0, 7)
}

function currentWeekFile() {
  const now = new Date()
  const year = now.getFullYear()
  // ISO week number
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}-W${String(weekNo).padStart(2, '0')}`
}

function currentQuarter() {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

function currentYear() {
  return String(new Date().getFullYear())
}

function extractTasks(body) {
  const tasks = { todo: [], done: [] }
  const lines = body.split('\n')
  for (const line of lines) {
    const doneMatch = line.match(/^\s*-\s*\[x\]\s*(.+)/i)
    const todoMatch = line.match(/^\s*-\s*\[\s\]\s*(.+)/)
    if (doneMatch && doneMatch[1].trim()) tasks.done.push(doneMatch[1].trim())
    else if (todoMatch && todoMatch[1].trim()) tasks.todo.push(todoMatch[1].trim())
  }
  return tasks
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len - 1) + '…' : str
}

function hr(title) {
  const width = 60
  console.log()
  console.log(`── ${title} ${'─'.repeat(Math.max(0, width - title.length - 4))}`)
}

function statusIcon(status) {
  switch (status) {
    case 'active': return '🟢'
    case 'completed': return '✅'
    case 'paused': return '⏸️'
    case 'planned': return '📋'
    default: return '⚪'
  }
}

// ── Commands ─────────────────────────────────────────────────

function cmdProjects(args) {
  const docs = readMdFiles(DIRS.projects)
  let filtered = docs
  if (args.status) {
    filtered = filtered.filter((d) => d.meta.status === args.status)
  }

  if (filtered.length === 0) {
    console.log('没有找到项目。')
    return
  }

  hr(`项目列表 (共 ${filtered.length} 个)`)
  for (const d of filtered) {
    const m = d.meta
    const icon = statusIcon(m.status)
    const period = `${m.startDate || '?'} → ${m.endDate || '至今'}`
    console.log(`  ${icon} ${m.title || d.file}`)
    console.log(`     状态: ${m.status || '-'}  |  类别: ${m.category || '-'}  |  ${period}`)
    if (m.summary) console.log(`     ${truncate(m.summary, 80)}`)
    if (m.tags && m.tags.length) console.log(`     标签: ${m.tags.join(', ')}`)

    // Timeline summary
    if (m.timeline && m.timeline.length > 0) {
      const latest = m.timeline[m.timeline.length - 1]
      console.log(`     最新进展: [${latest.date}] ${latest.title}`)
    }
    console.log()
  }
}

function cmdDaily(args) {
  const targetDate = args.date || today()
  const docs = readMdFiles(DIRS.daily)
  const doc = docs.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === targetDate || d.meta.date === targetDate || d.file.startsWith(targetDate)
  })

  if (!doc) {
    console.log(`没有找到 ${targetDate} 的日报。`)
    // Show available dates
    const available = docs.map((d) => d.meta.slug || d.meta.date || d.file.replace('.md', '')).sort()
    if (available.length > 0) {
      console.log(`可用日报: ${available.slice(-10).join(', ')}${available.length > 10 ? ` ... 共 ${available.length} 篇` : ''}`)
    }
    return
  }

  hr(`日报: ${doc.meta.title || targetDate}`)
  if (doc.meta.summary) console.log(`  摘要: ${doc.meta.summary}`)
  console.log()

  const tasks = extractTasks(doc.body)
  if (tasks.todo.length > 0) {
    console.log('  📋 待办:')
    for (const t of tasks.todo) console.log(`     ☐ ${t}`)
  }
  if (tasks.done.length > 0) {
    console.log('  ✅ 已完成:')
    for (const t of tasks.done) console.log(`     ☑ ${t}`)
  }
  if (tasks.todo.length === 0 && tasks.done.length === 0) {
    // Print first few sections of body
    const sections = doc.body.match(/^## .+$/gm)
    if (sections) {
      console.log('  章节:', sections.map((s) => s.replace('## ', '')).join(' | '))
    }
  }
  console.log()
}

function cmdWeekly(args) {
  let targetWeek
  if (args.week) {
    targetWeek = args.week
  } else if (args.date) {
    // Find the weekly file containing this date
    const docs = readMdFiles(DIRS.weekly)
    const doc = docs.find((d) => d.meta.date <= args.date)
    targetWeek = doc ? (doc.meta.slug || doc.file.replace('.md', '')) : currentWeekFile()
  } else {
    targetWeek = currentWeekFile()
  }

  const docs = readMdFiles(DIRS.weekly)
  const doc = docs.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === targetWeek || d.file.startsWith(targetWeek)
  })

  if (!doc) {
    console.log(`没有找到 ${targetWeek} 的周报。`)
    const available = docs.map((d) => d.meta.slug || d.file.replace('.md', '')).sort()
    if (available.length > 0) {
      console.log(`可用周报: ${available.join(', ')}`)
    }
    return
  }

  hr(`周报: ${doc.meta.title || targetWeek}`)
  if (doc.meta.summary) console.log(`  导航: ${doc.meta.summary}`)
  console.log()

  const tasks = extractTasks(doc.body)
  if (tasks.todo.length > 0) {
    console.log('  📋 待办:')
    for (const t of tasks.todo) console.log(`     ☐ ${t}`)
  }
  if (tasks.done.length > 0) {
    console.log('  ✅ 已完成:')
    for (const t of tasks.done) console.log(`     ☑ ${t}`)
  }
  console.log()
}

function cmdMonthly(args) {
  const targetMonth = args.date || currentMonth()
  const docs = readMdFiles(DIRS.monthly)
  const doc = docs.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === targetMonth || d.file.startsWith(targetMonth)
  })

  if (!doc) {
    console.log(`没有找到 ${targetMonth} 的月报。`)
    const available = docs.map((d) => d.meta.slug || d.file.replace('.md', '')).sort()
    if (available.length > 0) console.log(`可用月报: ${available.join(', ')}`)
    return
  }

  hr(`月报: ${doc.meta.title || targetMonth}`)
  if (doc.meta.summary) console.log(`  导航: ${doc.meta.summary}`)
  console.log()

  const tasks = extractTasks(doc.body)
  if (tasks.todo.length > 0) {
    console.log('  📋 待办:')
    for (const t of tasks.todo) console.log(`     ☐ ${t}`)
  }
  if (tasks.done.length > 0) {
    console.log('  ✅ 已完成:')
    for (const t of tasks.done) console.log(`     ☑ ${t}`)
  }
  console.log()
}

function cmdQuarterly(args) {
  const targetQ = args.date || currentQuarter()
  const docs = readMdFiles(DIRS.quarterly)
  const doc = docs.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === targetQ || d.file.startsWith(targetQ)
  })

  if (!doc) {
    console.log(`没有找到 ${targetQ} 的季报。`)
    const available = docs.map((d) => d.meta.slug || d.file.replace('.md', '')).sort()
    if (available.length > 0) console.log(`可用季报: ${available.join(', ')}`)
    return
  }

  hr(`季报: ${doc.meta.title || targetQ}`)
  if (doc.meta.summary) console.log(`  导航: ${doc.meta.summary}`)
  console.log()

  const tasks = extractTasks(doc.body)
  if (tasks.todo.length > 0) {
    console.log('  📋 待办:')
    for (const t of tasks.todo) console.log(`     ☐ ${t}`)
  }
  if (tasks.done.length > 0) {
    console.log('  ✅ 已完成:')
    for (const t of tasks.done) console.log(`     ☑ ${t}`)
  }
  console.log()
}

function cmdAnnual(args) {
  const targetYear = args.year || currentYear()
  const docs = readMdFiles(DIRS.annual)
  const doc = docs.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === targetYear || d.file.startsWith(targetYear)
  })

  if (!doc) {
    console.log(`没有找到 ${targetYear} 的年报。`)
    const available = docs.map((d) => d.meta.slug || d.file.replace('.md', '')).sort()
    if (available.length > 0) console.log(`可用年报: ${available.join(', ')}`)
    return
  }

  hr(`年报: ${doc.meta.title || targetYear}`)
  if (doc.meta.summary) console.log(`  导航: ${doc.meta.summary}`)
  console.log()

  const tasks = extractTasks(doc.body)
  if (tasks.todo.length > 0) {
    console.log('  📋 待办:')
    for (const t of tasks.todo) console.log(`     ☐ ${t}`)
  }
  if (tasks.done.length > 0) {
    console.log('  ✅ 已完成:')
    for (const t of tasks.done) console.log(`     ☑ ${t}`)
  }
  console.log()
}

function cmdOverview(_args) {
  console.log()
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║             lifeOS 综合概览                             ║')
  console.log('╚══════════════════════════════════════════════════════════╝')

  // Projects
  const projects = readMdFiles(DIRS.projects)
  const activeProjects = projects.filter((d) => d.meta.status === 'active')
  hr(`活跃项目 (${activeProjects.length})`)
  if (activeProjects.length === 0) {
    console.log('  无活跃项目')
  }
  for (const d of activeProjects) {
    console.log(`  ${statusIcon('active')} ${d.meta.title} — ${truncate(d.meta.summary, 60)}`)
  }

  // Today's daily
  const todayStr = today()
  const dailies = readMdFiles(DIRS.daily)
  const todayDoc = dailies.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === todayStr || d.meta.date === todayStr || d.file.startsWith(todayStr)
  })
  hr(`今日 (${todayStr})`)
  if (todayDoc) {
    const tasks = extractTasks(todayDoc.body)
    console.log(`  待办: ${tasks.todo.length}  已完成: ${tasks.done.length}`)
    for (const t of tasks.todo.slice(0, 5)) console.log(`     ☐ ${t}`)
    if (tasks.todo.length > 5) console.log(`     ... 还有 ${tasks.todo.length - 5} 项`)
  } else {
    console.log('  暂无今日日报')
  }

  // Current week
  const weekFile = currentWeekFile()
  const weeklies = readMdFiles(DIRS.weekly)
  const weekDoc = weeklies.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === weekFile || d.file.startsWith(weekFile)
  })
  hr(`本周 (${weekFile})`)
  if (weekDoc) {
    const tasks = extractTasks(weekDoc.body)
    console.log(`  待办: ${tasks.todo.length}  已完成: ${tasks.done.length}`)
    for (const t of tasks.todo.slice(0, 5)) console.log(`     ☐ ${t}`)
    if (tasks.todo.length > 5) console.log(`     ... 还有 ${tasks.todo.length - 5} 项`)
  } else {
    console.log('  暂无本周周报')
  }

  // Current month
  const month = currentMonth()
  const monthlies = readMdFiles(DIRS.monthly)
  const monthDoc = monthlies.find((d) => {
    const slug = d.meta.slug || d.file.replace('.md', '')
    return slug === month || d.file.startsWith(month)
  })
  hr(`本月 (${month})`)
  if (monthDoc) {
    const tasks = extractTasks(monthDoc.body)
    console.log(`  待办: ${tasks.todo.length}  已完成: ${tasks.done.length}`)
    for (const t of tasks.todo.slice(0, 5)) console.log(`     ☐ ${t}`)
    if (tasks.todo.length > 5) console.log(`     ... 还有 ${tasks.todo.length - 5} 项`)
  } else {
    console.log('  暂无本月月报')
  }

  console.log()
}

// ── Task tree helpers ─────────────────────────────────────────

function loadTaskTree(slug) {
  const filePath = join(DIRS.projects, slug, 'tasks.json')
  try {
    const tree = JSON.parse(readFileSync(filePath, 'utf-8'))
    tree.tasks = cascadeStatus(tree.tasks)
    return tree
  } catch {
    return null
  }
}

/** Cascade completion: mark parent completed if all children are completed */
function cascadeStatus(tasks) {
  return tasks.map((t) => {
    if (!t.children || t.children.length === 0) return t
    const children = cascadeStatus(t.children)
    const allCompleted = children.every((c) => c.status === 'completed')
    return { ...t, children, status: allCompleted ? 'completed' : t.status }
  })
}

function saveTaskTree(slug, data) {
  const filePath = join(DIRS.projects, slug, 'tasks.json')
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function printTaskTree(tasks, prefix = '', isLast = true) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const last = i === tasks.length - 1
    const connector = last ? '└─ ' : '├─ '
    const icon = task.status === 'completed' ? '☑' : task.status === 'active' ? '●' : task.status === 'blocked' ? '✖' : '○'
    const dateStr = task.startDate ? ` [${task.startDate}${task.endDate ? ` → ${task.endDate}` : ''}]` : ''
    console.log(`${prefix}${connector}${icon} ${task.title}${dateStr}`)
    if (task.children && task.children.length > 0) {
      const childPrefix = last ? '   ' : '│  '
      printTaskTree(task.children, prefix + childPrefix, last)
    }
  }
}

function findTaskInTree(tasks, taskId) {
  for (const t of tasks) {
    if (t.id === taskId) return t
    if (t.children) {
      const found = findTaskInTree(t.children, taskId)
      if (found) return found
    }
  }
  return null
}

function listAvailableTaskTrees() {
  try {
    return readdirSync(DIRS.projects, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(DIRS.projects, d.name, 'tasks.json')))
      .map((d) => d.name)
  } catch {
    return []
  }
}

function cmdTasks(args) {
  const slug = args.project
  if (!slug) {
    const available = listAvailableTaskTrees()
    if (available.length === 0) {
      console.log('没有找到任何任务树文件。')
      return
    }
    console.log('可用任务树：')
    for (const s of available) console.log(`  ${s}`)
    console.log('\n用法: node scripts/plans.mjs tasks --project <slug>')
    return
  }

  const tree = loadTaskTree(slug)
  if (!tree) {
    console.log(`找不到 ${slug} 的任务树文件。`)
    return
  }

  hr(`任务树: ${tree.project}`)
  printTaskTree(tree.tasks)
  console.log()
}

function cmdTaskUpdate(args) {
  if (!args.project || !args['task-id'] || !args.status) {
    console.error('错误: --project, --task-id, --status 都是必填项')
    process.exit(1)
  }

  const tree = loadTaskTree(args.project)
  if (!tree) {
    console.error(`找不到 ${args.project} 的任务树`)
    process.exit(1)
  }

  const task = findTaskInTree(tree.tasks, args['task-id'])
  if (!task) {
    console.error(`找不到任务 ID: ${args['task-id']}`)
    process.exit(1)
  }

  const oldStatus = task.status
  task.status = args.status
  saveTaskTree(args.project, tree)
  console.log(`✅ 已更新: ${task.title}  (${oldStatus} → ${args.status})`)
}

function cmdTaskAdd(args) {
  if (!args.project || !args.title) {
    console.error('错误: --project 和 --title 是必填项')
    console.error('用法:')
    console.error('  顶层任务: node scripts/plans.mjs task-add --project slug --title "..."')
    console.error('  子任务:   node scripts/plans.mjs task-add --project slug --parent id --title "..."')
    process.exit(1)
  }

  // Read raw tree (without cascade) so we can manipulate the actual data
  const filePath = join(DIRS.projects, args.project, 'tasks.json')
  if (!existsSync(filePath)) {
    console.error(`找不到 ${args.project} 的任务树文件`)
    process.exit(1)
  }
  const tree = JSON.parse(readFileSync(filePath, 'utf-8'))

  let newId
  let parentTitle = '(顶层)'

  if (args.parent) {
    const parent = findTaskById(tree.tasks, args.parent)
    if (!parent) {
      console.error(`找不到父任务 ID: ${args.parent}`)
      process.exit(1)
    }
    if (!parent.children) parent.children = []
    newId = `${args.parent}-${parent.children.length + 1}`
    parentTitle = parent.title
    parent.children.push(newTaskObj(newId, args))
  } else {
    // Top-level task: generate ID from existing top-level count
    const prefix = args['id-prefix'] || 't'
    const existingNums = tree.tasks
      .filter(t => t.id && t.id.startsWith(prefix + '-') )
      .map(t => parseInt(t.id.split('-')[1], 10))
      .filter(n => !isNaN(n))
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : tree.tasks.length
    newId = `${prefix}-${maxNum + 1}`
    tree.tasks.push(newTaskObj(newId, args))
  }

  writeFileSync(filePath, JSON.stringify(tree, null, 2) + '\n', 'utf-8')
  console.log(`✅ 已添加任务: ${args.title} (ID: ${newId})  → 父任务: ${parentTitle}`)
}

function newTaskObj(id, args) {
  const obj = {
    id,
    title: args.title,
    status: args.status || 'planned',
    startDate: args['start-date'] || null,
    endDate: args['end-date'] || null,
    description: args.description || '',
    children: [],
  }
  // Optional scheduling fields
  if (args['start-time']) obj.startTime = args['start-time']
  if (args['end-time']) obj.endTime = args['end-time']
  if (args.location) obj.location = args.location
  if (args.category) obj.category = args.category
  return obj
}

// ── Task edit / delete ────────────────────────────────────────

/** Find the parent array that contains a given task id */
function findTaskParent(tasks, taskId, parent = null) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) return { array: tasks, index: i, parent }
    if (tasks[i].children && tasks[i].children.length > 0) {
      const result = findTaskParent(tasks[i].children, taskId, tasks[i])
      if (result) return result
    }
  }
  return null
}

const EDITABLE_FIELDS = {
  'title':       'title',
  'status':      'status',
  'start-date':  'startDate',
  'end-date':    'endDate',
  'start-time':  'startTime',
  'end-time':    'endTime',
  'location':    'location',
  'category':    'category',
  'description': 'description',
}

function cmdTaskEdit(args) {
  if (!args.project || !args['task-id']) {
    console.error('错误: --project 和 --task-id 是必填项')
    console.error('可编辑字段: --title, --status, --start-date, --end-date, --start-time, --end-time, --location, --category, --description')
    console.error('用法: node scripts/plans.mjs task-edit --project slug --task-id t1-1 --title "新标题" --status completed')
    process.exit(1)
  }

  const tree = loadTaskTree(args.project)
  if (!tree) {
    console.error(`找不到 ${args.project} 的任务树`)
    process.exit(1)
  }

  const task = findTaskInTree(tree.tasks, args['task-id'])
  if (!task) {
    console.error(`找不到任务 ID: ${args['task-id']}`)
    process.exit(1)
  }

  const changes = []
  for (const [cliKey, fieldKey] of Object.entries(EDITABLE_FIELDS)) {
    if (args[cliKey] !== undefined) {
      const oldVal = task[fieldKey]
      // Treat 'null' string as actual null for date fields
      let newVal = args[cliKey]
      if (newVal === 'null') newVal = null
      task[fieldKey] = newVal
      const oldStr = oldVal === null ? '∅' : String(oldVal)
      const newStr = newVal === null ? '∅' : String(newVal)
      if (oldStr !== newStr) {
        changes.push(`  ${fieldKey}: ${oldStr} → ${newStr}`)
      }
    }
  }

  if (changes.length === 0) {
    console.log('没有提供要修改的字段。可编辑字段:')
    console.log('  --title, --status, --start-date, --end-date, --start-time, --end-time, --location, --category, --description')
    return
  }

  saveTaskTree(args.project, tree)
  console.log(`✅ 已编辑任务: ${task.title} (ID: ${args['task-id']})`)
  for (const c of changes) console.log(c)
}

function cmdTaskDelete(args) {
  if (!args.project || !args['task-id']) {
    console.error('错误: --project 和 --task-id 是必填项')
    console.error('用法: node scripts/plans.mjs task-delete --project slug --task-id t1-1')
    process.exit(1)
  }

  const tree = loadTaskTree(args.project)
  if (!tree) {
    console.error(`找不到 ${args.project} 的任务树`)
    process.exit(1)
  }

  const result = findTaskParent(tree.tasks, args['task-id'])
  if (!result) {
    console.error(`找不到任务 ID: ${args['task-id']}`)
    process.exit(1)
  }

  const task = result.array[result.index]
  const childCount = task.children ? task.children.length : 0

  // Confirm if task has children
  if (childCount > 0 && !args.force) {
    console.error(`⚠️  任务 "${task.title}" 有 ${childCount} 个子任务，删除会一并移除它们。`)
    console.error('    如确认要删除，请加 --force 参数')
    process.exit(1)
  }

  result.array.splice(result.index, 1)
  saveTaskTree(args.project, tree)
  console.log(`🗑️  已删除: ${task.title} (ID: ${args['task-id']})`)
  if (childCount > 0) console.log(`    同时删除了 ${childCount} 个子任务`)
}

// ── Project creation ───────────────────────────────────────────

function cmdProjectCreate(args) {
  if (!args.slug || !args.title) {
    console.error('错误: --slug 和 --title 是必填项')
    console.error('用法: node scripts/plans.mjs project-create --slug my-project --title "项目名" [--category work] [--summary "..."]')
    process.exit(1)
  }

  const projectDir = join(DIRS.projects, args.slug)
  if (existsSync(projectDir)) {
    console.error(`错误: 项目目录已存在: ${projectDir}`)
    process.exit(1)
  }

  // Create directory
  mkdirSync(projectDir, { recursive: true })

  const category = args.category || 'work'
  const summary = args.summary || ''
  const status = args.status || 'active'
  const startDate = args['start-date'] || today()
  const tags = args.tags ? args.tags.split(',').map(t => t.trim()) : []

  // Generate README.md
  const readmeContent = `---
title: ${args.title}
slug: ${args.slug}
status: ${status}
startDate: ${startDate}
endDate: null
category: ${category}
${tags.length > 0 ? `tags:
${tags.map(t => `  - ${t}`).join('\n')}` : `tags: []`}
summary: ${summary}
timeline:
  - date: ${startDate}
    title: 项目创建
    type: milestone
    description: ${summary || '项目创建'}
---

# ${args.title}

${summary}
`
  writeFileSync(join(projectDir, 'README.md'), readmeContent, 'utf-8')

  // Generate tasks.json skeleton
  const tasksContent = {
    project: args.slug,
    tasks: [],
  }
  writeFileSync(join(projectDir, 'tasks.json'), JSON.stringify(tasksContent, null, 2) + '\n', 'utf-8')

  console.log(`✅ 已创建项目: ${args.title}`)
  console.log(`   目录: ${projectDir}`)
  console.log(`   slug: ${args.slug}`)
  console.log(`   类别: ${category}  状态: ${status}  起始: ${startDate}`)
  console.log(`   下一步: 用 task-add --project ${args.slug} --parent "" 添加顶层任务（或直接编辑 tasks.json）`)
}

// ── Recurring task management ─────────────────────────────────

function cmdRecurringAdd(args) {
  if (!args.project || !args.title || !args.pattern || !args['report-levels']) {
    console.error('错误: --project, --title, --pattern, --report-levels 为必填项')
    console.error('用法: node scripts/plans.mjs recurring-add --project slug --title "..." --pattern daily --report-levels daily,weekly')
    process.exit(1)
  }

  const validPatterns = ['daily', 'weekly', 'every-N-days']
  if (!validPatterns.includes(args.pattern)) {
    console.error('错误: --pattern 必须是 ' + validPatterns.join(', ') + ' 之一')
    process.exit(1)
  }

  if (args.pattern === 'every-N-days' && !args.every) {
    console.error('错误: --pattern every-N-days 需要 --every N 参数')
    process.exit(1)
  }

  const reportLevels = args['report-levels'].split(',').map((s) => s.trim())
  const validLevels = ['daily', 'weekly', 'monthly', 'quarterly']
  for (const lvl of reportLevels) {
    if (!validLevels.includes(lvl)) {
      console.error('错误: report-level 值无效: ' + lvl + ' (可选: ' + validLevels.join(', ') + ')')
      process.exit(1)
    }
  }

  const tree = loadTaskTree(args.project)
  if (!tree) {
    console.error('错误: 找不到项目 ' + args.project)
    process.exit(1)
  }

  // Find parent or use top-level
  let parent = null
  if (args.parent) {
    parent = findTaskById(tree.tasks, args.parent)
    if (!parent) {
      console.error('错误: 找不到父任务 ' + args.parent)
      process.exit(1)
    }
  }

  // Generate ID
  const existingIds = new Set()
  collectIds(tree.tasks, existingIds)
  let maxNum = 0
  for (const id of existingIds) {
    if (id.startsWith('r-')) {
      const num = parseInt(id.slice(2), 10)
      if (num > maxNum) maxNum = num
    }
  }
  const newId = 'r-' + (maxNum + 1)

  const recurringTask = {
    id: newId,
    title: args.title,
    status: 'active',
    startDate: null,
    endDate: null,
    description: args.description || '',
    recurring: {
      pattern: args.pattern,
      every: args.every ? parseInt(args.every, 10) : undefined,
      startTime: args.start || undefined,
      endTime: args.end || undefined,
      activeFrom: args.from || new Date().toISOString().slice(0, 10),
      activeUntil: args.until || null,
      excludeDates: [],
      reportLevels: reportLevels,
    },
    children: [],
  }

  if (parent) {
    parent.children.push(recurringTask)
  } else {
    tree.tasks.push(recurringTask)
  }

  // Save without cascade (raw data)
  const rawTree = JSON.parse(readFileSync(join(DIRS.projects, args.project, 'tasks.json'), 'utf-8'))
  if (parent) {
    const rawParent = findTaskById(rawTree.tasks, args.parent)
    rawParent.children.push(recurringTask)
  } else {
    rawTree.tasks.push(recurringTask)
  }
  saveTaskTree(args.project, rawTree)

  console.log('✅ 已添加周期任务: ' + recurringTask.title)
  console.log('   ID: ' + newId)
  console.log('   项目: ' + args.project)
  console.log('   频率: ' + args.pattern + (args.every ? ' (每' + args.every + '天)' : ''))
  console.log('   报告层级: ' + reportLevels.join(', '))
  if (args.start) console.log('   时间: ' + args.start + (args.end ? ' - ' + args.end : ''))
}

function cmdRecurringList(args) {
  if (!args.project) {
    // List recurring tasks across all projects
    const projects = listAvailableTaskTrees()
    let found = false
    for (const slug of projects) {
      const tree = loadTaskTree(slug)
      if (!tree) continue
      const recurring = [];
      (function find(tasks) {
        for (const t of tasks) {
          if (t.recurring) recurring.push(t)
          if (t.children && t.children.length > 0) find(t.children)
        }
      })(tree.tasks)
      if (recurring.length > 0) {
        found = true
        console.log('\n── ' + slug + ' ──')
        for (const t of recurring) {
          const r = t.recurring
          console.log('  ' + t.id + ' ' + t.title)
          console.log('    频率: ' + r.pattern + (r.every ? ' (每' + r.every + '天)' : ''))
          console.log('    报告: ' + r.reportLevels.join(', '))
          if (r.startTime) console.log('    时间: ' + r.startTime + (r.endTime ? ' - ' + r.endTime : ''))
        }
      }
    }
    if (!found) console.log('没有找到周期任务。')
    return
  }

  const tree = loadTaskTree(args.project)
  if (!tree) {
    console.error('错误: 找不到项目 ' + args.project)
    process.exit(1)
  }
  const recurring = [];
  (function find(tasks) {
    for (const t of tasks) {
      if (t.recurring) recurring.push(t)
      if (t.children && t.children.length > 0) find(t.children)
    }
  })(tree.tasks)
  if (recurring.length === 0) {
    console.log('项目 ' + args.project + ' 没有周期任务。')
    return
  }
  for (const t of recurring) {
    const r = t.recurring
    console.log(t.id + ' ' + t.title)
    console.log('  频率: ' + r.pattern + (r.every ? ' (每' + r.every + '天)' : ''))
    console.log('  报告: ' + r.reportLevels.join(', '))
    if (r.startTime) console.log('  时间: ' + r.startTime + (r.endTime ? ' - ' + r.endTime : ''))
  }
}

function collectIds(tasks, set) {
  for (const t of tasks) {
    set.add(t.id)
    if (t.children && t.children.length > 0) collectIds(t.children, set)
  }
}

function findTaskById(tasks, id) {
  for (const t of tasks) {
    if (t.id === id) return t
    if (t.children && t.children.length > 0) {
      const found = findTaskById(t.children, id)
      if (found) return found
    }
  }
  return null
}

// ── Main ─────────────────────────────────────────────────────

const [, , command, ...rest] = process.argv
const args = parseArgs(rest)

switch (command) {
  case 'projects':
    cmdProjects(args)
    break
  case 'daily':
    cmdDaily(args)
    break
  case 'weekly':
    cmdWeekly(args)
    break
  case 'monthly':
    cmdMonthly(args)
    break
  case 'quarterly':
    cmdQuarterly(args)
    break
  case 'annual':
    cmdAnnual(args)
    break
  case 'overview':
    cmdOverview(args)
    break
  case 'tasks':
    cmdTasks(args)
    break
  case 'task-update':
    cmdTaskUpdate(args)
    break
  case 'task-add':
    cmdTaskAdd(args)
    break
  case 'task-edit':
    cmdTaskEdit(args)
    break
  case 'task-delete':
    cmdTaskDelete(args)
    break
  case 'project-create':
    cmdProjectCreate(args)
    break
  case 'recurring-add':
    cmdRecurringAdd(args)
    break
  case 'recurring-list':
    cmdRecurringList(args)
    break
  default:
    console.log(`
lifeOS Plans CLI — 快速列出项目与各级计划

用法:
  node scripts/plans.mjs <command> [options]

命令:
  projects        列出项目             [--status active|completed|paused|planned]
  project-create  创建新项目           --slug my-project --title "项目名" [--category work] [--summary "..."] [--status active]
  daily           查看日报             [--date YYYY-MM-DD]  (默认今天)
  weekly          查看周报             [--date YYYY-MM-DD | --week YYYY-WNN]  (默认本周)
  monthly         查看月报             [--date YYYY-MM]  (默认本月)
  quarterly       查看季报             [--date YYYY-QN]  (默认本季)
  annual          查看年报             [--year YYYY]  (默认今年)
  overview        综合概览             一览项目/日/周/月待办
  tasks           列出任务树           [--project slug]
  task-add        添加任务             --project slug --title "..." [--parent id] [--status active] [--start-date ...] [--end-date ...] [--description ...]
  task-update     更新任务状态         --project slug --task-id id --status completed
  task-edit       编辑任务字段         --project slug --task-id id [--title "..."] [--status ...] [--start-date ...] [--end-date ...] [--description ...] ...
  task-delete     删除任务             --project slug --task-id id [--force]
  recurring-add   添加周期任务         --project slug --title "..." --pattern daily|weekly|every-N-days --report-levels daily,weekly [--every N] [--start HH:MM] [--end HH:MM] [--from YYYY-MM-DD] [--until YYYY-MM-DD] [--parent id]
  recurring-list  列出周期任务         [--project slug]

示例:
  node scripts/plans.mjs overview
  node scripts/plans.mjs projects --status active
  node scripts/plans.mjs project-create --slug my-project --title "我的项目" --category work --summary "一句话描述"
  node scripts/plans.mjs daily --date 2026-06-30
  node scripts/plans.mjs weekly --week 2026-06-W26
  node scripts/plans.mjs monthly --date 2026-06
  node scripts/plans.mjs quarterly --date 2026-Q2
  node scripts/plans.mjs annual --year 2026
  node scripts/plans.mjs tasks --project dingtalk-digital-human
  node scripts/plans.mjs task-add --project dingtalk-digital-human --parent t3 --title "新任务"
  node scripts/plans.mjs task-update --project lifeos --task-id t1-1 --status completed
  node scripts/plans.mjs task-edit --project dingtalk-digital-human --task-id t4-4-1 --status completed --end-date 2026-07-08
  node scripts/plans.mjs task-delete --project dingtalk-digital-human --task-id t1-1
  node scripts/plans.mjs task-delete --project dingtalk-digital-human --task-id t1-1 --force
  node scripts/plans.mjs recurring-add --project lifeos --title "每日代码提交" --pattern daily --report-levels daily,weekly
  node scripts/plans.mjs recurring-list
`)
    break
}
