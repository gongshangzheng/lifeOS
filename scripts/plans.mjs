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

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
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
  if (!args.project || !args.parent || !args.title) {
    console.error('错误: --project, --parent, --title 都是必填项')
    process.exit(1)
  }

  const tree = loadTaskTree(args.project)
  if (!tree) {
    console.error(`找不到 ${args.project} 的任务树`)
    process.exit(1)
  }

  const parent = findTaskInTree(tree.tasks, args.parent)
  if (!parent) {
    console.error(`找不到父任务 ID: ${args.parent}`)
    process.exit(1)
  }

  const newId = `${args.parent}-${parent.children.length + 1}`
  const newTask = {
    id: newId,
    title: args.title,
    status: args.status || 'planned',
    startDate: args['start-date'] || null,
    endDate: args['end-date'] || null,
    description: args.description || '',
    children: [],
  }

  parent.children.push(newTask)
  saveTaskTree(args.project, tree)
  console.log(`✅ 已添加任务: ${newTask.title} (ID: ${newId})  → 父任务: ${parent.title}`)
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
  default:
    console.log(`
lifeOS Plans CLI — 快速列出项目与各级计划

用法:
  node scripts/plans.mjs <command> [options]

命令:
  projects      列出项目             [--status active|completed|paused|planned]
  daily         查看日报             [--date YYYY-MM-DD]  (默认今天)
  weekly        查看周报             [--date YYYY-MM-DD | --week YYYY-WNN]  (默认本周)
  monthly       查看月报             [--date YYYY-MM]  (默认本月)
  quarterly     查看季报             [--date YYYY-QN]  (默认本季)
  annual        查看年报             [--year YYYY]  (默认今年)
  overview      综合概览             一览项目/日/周/月待办
  tasks         列出任务树           [--project slug]
  task-update   更新任务状态         --project slug --task-id id --status completed
  task-add      添加子任务           --project slug --parent id --title "..." [--status active]

示例:
  node scripts/plans.mjs overview
  node scripts/plans.mjs projects --status active
  node scripts/plans.mjs daily --date 2026-06-30
  node scripts/plans.mjs weekly --week 2026-06-W26
  node scripts/plans.mjs monthly --date 2026-06
  node scripts/plans.mjs quarterly --date 2026-Q2
  node scripts/plans.mjs annual --year 2026
  node scripts/plans.mjs tasks --project dingtalk-digital-human
  node scripts/plans.mjs task-update --project lifeos --task-id t1-1 --status completed
  node scripts/plans.mjs task-add --project dingtalk-digital-human --parent t3 --title "新任务"
`)
    break
}
