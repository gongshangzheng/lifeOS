#!/usr/bin/env node
// ============================================================
// lifeOS Event Manager CLI
// ============================================================
// Manages events and recurring patterns in events.json.
// Usage:
//   node scripts/events.mjs list [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--category CAT]
//   node scripts/events.mjs add --title "..." --date YYYY-MM-DD [--start HH:MM] [--end HH:MM] [--location "..."] [--category study|health|work|social|life|other] [--description "..."]
//   node scripts/events.mjs add-recurring --title "..." --pattern daily|weekly|every-N-days [--every N] --start HH:MM --end HH:MM [--from YYYY-MM-DD] [--until YYYY-MM-DD] [--location "..."] [--category "..."] [--description "..."]
//   node scripts/events.mjs update --id EVENT_ID [--title "..."] [--date YYYY-MM-DD] [--start HH:MM] [--end HH:MM] [--location "..."] [--category "..."] [--description "..."]
//   node scripts/events.mjs delete --id EVENT_ID
//   node scripts/events.mjs expand [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--dry-run]
//   node scripts/events.mjs batch-add --file events-batch.json
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EVENTS_FILE = resolve(__dirname, '../apps/web/public/events.json')

// ── Helpers ──────────────────────────────────────────────────

function loadEvents() {
  try {
    return JSON.parse(readFileSync(EVENTS_FILE, 'utf-8'))
  } catch {
    return { events: [], recurring: [], categories: {} }
  }
}

function saveEvents(data) {
  writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function genId(prefix) {
  const now = new Date()
  const ts = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14)
  return `${prefix}-${ts}-${Math.random().toString(36).slice(2, 8)}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
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

// ── Commands ─────────────────────────────────────────────────

function cmdList(args) {
  const data = loadEvents()
  let events = data.events

  if (args.from) events = events.filter((e) => e.date >= args.from)
  if (args.to) events = events.filter((e) => e.date <= args.to)
  if (args.category) events = events.filter((e) => e.category === args.category)

  events.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))

  if (events.length === 0) {
    console.log('没有找到匹配的事件。')
    return
  }

  console.log(`共 ${events.length} 个事件：\n`)
  for (const e of events) {
    const time = [e.startTime, e.endTime].filter(Boolean).join(' – ') || '全天'
    console.log(`  [${e.id}] ${e.date} ${time}`)
    console.log(`    ${e.title}${e.location ? ` @ ${e.location}` : ''}`)
    if (e.description) console.log(`    ${e.description}`)
    console.log()
  }
}

function cmdAdd(args) {
  if (!args.title || !args.date) {
    console.error('错误: --title 和 --date 是必填项')
    process.exit(1)
  }

  const data = loadEvents()
  const event = {
    id: genId('evt'),
    title: args.title,
    date: args.date,
    startTime: args.start || undefined,
    endTime: args.end || undefined,
    location: args.location || undefined,
    category: args.category || 'other',
    description: args.description || undefined,
  }

  data.events.push(event)
  saveEvents(data)
  console.log(`✅ 已添加事件: ${event.title} (${event.date})`)
  console.log(`   ID: ${event.id}`)
}

function cmdAddRecurring(args) {
  if (!args.title || !args.pattern || !args.start || !args.end) {
    console.error('错误: --title, --pattern, --start, --end 是必填项')
    process.exit(1)
  }

  const validPatterns = ['daily', 'weekly', 'every-N-days']
  if (!validPatterns.includes(args.pattern)) {
    console.error(`错误: --pattern 必须是 ${validPatterns.join(', ')} 之一`)
    process.exit(1)
  }

  if (args.pattern === 'every-N-days' && !args.every) {
    console.error('错误: --pattern every-N-days 需要 --every N 参数')
    process.exit(1)
  }

  const data = loadEvents()
  const recurring = {
    id: genId('recur'),
    title: args.title,
    pattern: args.pattern,
    every: args.every ? parseInt(args.every, 10) : undefined,
    startTime: args.start,
    endTime: args.end,
    location: args.location || undefined,
    category: args.category || 'other',
    description: args.description || undefined,
    activeFrom: args.from || today(),
    activeUntil: args.until || null,
    excludeDates: [],
  }

  data.recurring.push(recurring)
  saveEvents(data)
  console.log(`✅ 已添加周期任务: ${recurring.title} (${recurring.pattern})`)
  console.log(`   ID: ${recurring.id}`)
}

function cmdUpdate(args) {
  if (!args.id) {
    console.error('错误: --id 是必填项')
    process.exit(1)
  }

  const data = loadEvents()
  const event = data.events.find((e) => e.id === args.id)
  if (!event) {
    console.error(`错误: 找不到 ID 为 ${args.id} 的事件`)
    process.exit(1)
  }

  if (args.title) event.title = args.title
  if (args.date) event.date = args.date
  if (args.start) event.startTime = args.start
  if (args.end) event.endTime = args.end
  if (args.location !== undefined) event.location = args.location || undefined
  if (args.category) event.category = args.category
  if (args.description !== undefined) event.description = args.description || undefined

  saveEvents(data)
  console.log(`✅ 已更新事件: ${event.title} (${event.date})`)
}

function cmdDelete(args) {
  if (!args.id) {
    console.error('错误: --id 是必填项')
    process.exit(1)
  }

  const data = loadEvents()
  const idx = data.events.findIndex((e) => e.id === args.id)
  if (idx === -1) {
    // Try deleting from recurring
    const rIdx = data.recurring.findIndex((r) => r.id === args.id)
    if (rIdx === -1) {
      console.error(`错误: 找不到 ID 为 ${args.id} 的事件或周期任务`)
      process.exit(1)
    }
    const removed = data.recurring.splice(rIdx, 1)[0]
    saveEvents(data)
    console.log(`✅ 已删除周期任务: ${removed.title}`)
    return
  }

  const removed = data.events.splice(idx, 1)[0]
  saveEvents(data)
  console.log(`✅ 已删除事件: ${removed.title} (${removed.date})`)
}

function cmdExpand(args) {
  const data = loadEvents()
  if (!data.recurring || data.recurring.length === 0) {
    console.log('没有周期任务需要展开。')
    return
  }

  const fromDate = args.from || today()
  const toDate = args.to || (() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })()

  const existingIds = new Set(data.events.map((e) => e.id))
  const newEvents = []

  for (const recur of data.recurring) {
    const start = new Date(Math.max(new Date(fromDate).getTime(), new Date(recur.activeFrom).getTime()))
    const end = recur.activeUntil ? new Date(Math.min(new Date(toDate).getTime(), new Date(recur.activeUntil).getTime())) : new Date(toDate)

    const excludeSet = new Set(recur.excludeDates || [])
    let current = new Date(start)

    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10)
      if (!excludeSet.has(dateStr)) {
        const eventId = `evt-${dateStr.replace(/-/g, '')}-${recur.id}`
        if (!existingIds.has(eventId) && !newEvents.some((e) => e.id === eventId)) {
          newEvents.push({
            id: eventId,
            title: recur.title,
            date: dateStr,
            startTime: recur.startTime,
            endTime: recur.endTime,
            location: recur.location,
            category: recur.category,
            description: recur.description,
            _recurringId: recur.id,
          })
        }
      }

      // Advance based on pattern
      if (recur.pattern === 'daily') {
        current.setDate(current.getDate() + 1)
      } else if (recur.pattern === 'weekly') {
        current.setDate(current.getDate() + 7)
      } else if (recur.pattern === 'every-N-days') {
        current.setDate(current.getDate() + (recur.every || 3))
      } else {
        break
      }
    }
  }

  if (args['dry-run']) {
    console.log(`[dry-run] 将展开 ${newEvents.length} 个事件（${fromDate} ~ ${toDate}）：`)
    for (const e of newEvents.slice(0, 10)) {
      console.log(`  ${e.date} ${e.startTime}–${e.endTime} ${e.title}`)
    }
    if (newEvents.length > 10) console.log(`  ... 还有 ${newEvents.length - 10} 个`)
    return
  }

  data.events.push(...newEvents)
  saveEvents(data)
  console.log(`✅ 已展开 ${newEvents.length} 个周期事件（${fromDate} ~ ${toDate}）`)
}

function cmdBatchAdd(args) {
  if (!args.file) {
    console.error('错误: --file 是必填项，指向包含事件数组的 JSON 文件')
    process.exit(1)
  }

  const batchPath = resolve(process.cwd(), args.file)
  let batch
  try {
    batch = JSON.parse(readFileSync(batchPath, 'utf-8'))
  } catch (err) {
    console.error(`错误: 无法读取 ${batchPath}: ${err.message}`)
    process.exit(1)
  }

  const events = Array.isArray(batch) ? batch : batch.events
  if (!Array.isArray(events) || events.length === 0) {
    console.error('错误: JSON 文件必须包含一个非空的事件数组')
    process.exit(1)
  }

  const data = loadEvents()
  let added = 0
  for (const raw of events) {
    if (!raw.title || !raw.date) {
      console.warn(`⚠️  跳过无效事件: ${JSON.stringify(raw)}`)
      continue
    }
    data.events.push({
      id: raw.id || genId('evt'),
      title: raw.title,
      date: raw.date,
      startTime: raw.startTime || raw.start || undefined,
      endTime: raw.endTime || raw.end || undefined,
      location: raw.location || undefined,
      category: raw.category || 'other',
      description: raw.description || undefined,
    })
    added++
  }

  saveEvents(data)
  console.log(`✅ 批量添加完成: ${added}/${events.length} 个事件`)
}

// ── Main ─────────────────────────────────────────────────────

const [, , command, ...rest] = process.argv
const args = parseArgs(rest)

switch (command) {
  case 'list':
    cmdList(args)
    break
  case 'add':
    cmdAdd(args)
    break
  case 'add-recurring':
    cmdAddRecurring(args)
    break
  case 'update':
    cmdUpdate(args)
    break
  case 'delete':
    cmdDelete(args)
    break
  case 'expand':
    cmdExpand(args)
    break
  case 'batch-add':
    cmdBatchAdd(args)
    break
  default:
    console.log(`
lifeOS Event Manager CLI

用法:
  node scripts/events.mjs <command> [options]

命令:
  list          列出事件
  add           添加单个事件
  add-recurring 添加周期任务
  update        更新事件
  delete        删除事件或周期任务
  expand        将周期任务展开为具体事件
  batch-add     从 JSON 文件批量添加

示例:
  node scripts/events.mjs add --title "复习DSP" --date 2026-07-01 --start 09:00 --end 19:00 --location 工位 --category study
  node scripts/events.mjs add-recurring --title "跑步6km" --pattern daily --start 06:30 --end 07:15 --category health
  node scripts/events.mjs expand --from 2026-07-01 --to 2026-07-31
  node scripts/events.mjs list --from 2026-07-01 --to 2026-07-07
  node scripts/events.mjs delete --id evt-20260701-abc123
`)
    break
}
