#!/usr/bin/env node
// ============================================================
// lifeOS Event Viewer CLI
// ============================================================
// 快速查看某个时间段内的事件，支持多种展示模式。
//
// 用法:
//   node scripts/events-view.mjs --today
//   node scripts/events-view.mjs --tomorrow
//   node scripts/events-view.mjs --week
//   node scripts/events-view.mjs --month
//   node scripts/events-view.mjs --from 2026-07-01 --to 2026-07-07
//   node scripts/events-view.mjs --from 2026-07-01 --to 2026-07-07 --category study
//   node scripts/events-view.mjs --today --timeline
//   node scripts/events-view.mjs --week --group
//   node scripts/events-view.mjs --today --with-recurring
//   node scripts/events-view.mjs --tomorrow --check-conflicts
// ============================================================

import { readFileSync } from 'node:fs'
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

function today() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = addDays(dateStr, mondayOffset)
  return { from: monday, to: addDays(monday, 6) }
}

function getMonthRange(dateStr) {
  const d = new Date(dateStr)
  const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { from: first, to: last }
}

function expandRecurring(data, fromDate, toDate) {
  if (!data.recurring || data.recurring.length === 0) return []
  const out = []
  for (const recur of data.recurring) {
    const startMs = Math.max(new Date(fromDate).getTime(), new Date(recur.activeFrom).getTime())
    const endMs = recur.activeUntil
      ? Math.min(new Date(toDate).getTime(), new Date(recur.activeUntil).getTime())
      : new Date(toDate).getTime()
    if (startMs > endMs) continue
    const excludeSet = new Set(recur.excludeDates || [])
    let cur = new Date(startMs)
    while (cur <= new Date(endMs)) {
      const dateStr = cur.toISOString().slice(0, 10)
      if (!excludeSet.has(dateStr)) {
        out.push({
          id: `evt-${dateStr.replace(/-/g, '')}-${recur.id}`,
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
      if (recur.pattern === 'daily') cur.setDate(cur.getDate() + 1)
      else if (recur.pattern === 'weekly') cur.setDate(cur.getDate() + 7)
      else if (recur.pattern === 'every-N-days') cur.setDate(cur.getDate() + (recur.every || 3))
      else break
    }
  }
  return out
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const key = argv[i].slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      args[key] = next
      i++
    } else {
      args[key] = true
    }
  }
  return args
}

function pad(s, n) {
  s = String(s ?? '')
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length)
}

function padR(s, n) {
  s = String(s ?? '')
  return s.length >= n ? s.slice(0, n) : ' '.repeat(n - s.length) + s
}

const C = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

const color = (t, c) => (process.stdout.isTTY ? `${C[c] || ''}${t}${C.reset}` : t)

const CAT_COLOR = {
  study: 'blue',
  health: 'green',
  work: 'yellow',
  social: 'magenta',
  life: 'cyan',
  other: 'gray',
}

function weekdayCN(dateStr) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(dateStr).getDay()]
}

function durationMin(start, end) {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

function fmtTime(s) {
  if (!s) return '全天'
  return s
}

// ── Display Modes ────────────────────────────────────────────

function displayCompact(events, categories, fromDate, toDate) {
  const filtered = events
    .filter((e) => e.date >= fromDate && e.date <= toDate)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))

  if (filtered.length === 0) {
    console.log(`📭 没有事件 (${fromDate} ~ ${toDate})`)
    return
  }

  console.log(color(`\n📅 ${fromDate} ~ ${toDate}  共 ${filtered.length} 个事件\n`, 'bold'))

  let lastDate = null
  for (const e of filtered) {
    if (e.date !== lastDate) {
      console.log(color(`▸ ${e.date} ${weekdayCN(e.date)}`, 'bold'))
      lastDate = e.date
    }
    const time = [e.startTime, e.endTime].filter(Boolean).join('–') || '全天'
    const cat = e.category || 'other'
    const catLabel = categories[cat]?.label || cat
    const recurMark = e._recurringId ? color(' ↻', 'gray') : ''
    console.log(
      `  ${pad(time, 12)} ${color(pad(catLabel, 4), CAT_COLOR[cat] || 'gray')}  ${e.title}${e.location ? color(` @ ${e.location}`, 'gray') : ''}${recurMark}`,
    )
  }
  console.log()
}

function displayTimeline(events, categories, fromDate, toDate) {
  const filtered = events
    .filter((e) => e.date >= fromDate && e.date <= toDate && e.startTime)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  if (filtered.length === 0) {
    console.log(`📭 没有定时事件 (${fromDate} ~ ${toDate})`)
    return
  }

  console.log(color(`\n⏱  时间轴视图 (${fromDate} ~ ${toDate})\n`, 'bold'))

  let lastDate = null
  for (const e of filtered) {
    if (e.date !== lastDate) {
      console.log(color(`\n  ${e.date} ${weekdayCN(e.date)}`, 'bold'))
      lastDate = e.date
    }
    const dur = durationMin(e.startTime, e.endTime)
    const cat = e.category || 'other'
    const catLabel = categories[cat]?.label || cat
    const barLen = Math.max(1, Math.round(dur / 30))
    const bar = '█'.repeat(Math.min(barLen, 40))
    console.log(
      `    ${pad(e.startTime, 5)}–${pad(e.endTime || '?', 5)} ${color(padR(bar, 40), CAT_COLOR[cat] || 'gray')}  ${e.title} (${dur}min, ${catLabel})`,
    )
  }
  console.log()
}

function displayGroup(events, categories, fromDate, toDate) {
  const filtered = events.filter((e) => e.date >= fromDate && e.date <= toDate)
  const grouped = {}
  for (const e of filtered) {
    const cat = e.category || 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(e)
  }

  if (Object.keys(grouped).length === 0) {
    console.log(`📭 没有事件 (${fromDate} ~ ${toDate})`)
    return
  }

  const totalHours = filtered.reduce((sum, e) => sum + durationMin(e.startTime, e.endTime), 0) / 60

  console.log(
    color(`\n📊 分组视图 (${fromDate} ~ ${toDate})  共 ${filtered.length} 个事件 / ${totalHours.toFixed(1)}h\n`, 'bold'),
  )

  const sorted = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)
  for (const [cat, evts] of sorted) {
    const catLabel = categories[cat]?.label || cat
    const hours = evts.reduce((sum, e) => sum + durationMin(e.startTime, e.endTime), 0) / 60
    console.log(color(`  ${catLabel} (${evts.length} 个 / ${hours.toFixed(1)}h)`, CAT_COLOR[cat] || 'gray'))
    for (const e of evts.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))) {
      const time = [e.startTime, e.endTime].filter(Boolean).join('–') || '全天'
      console.log(`    ${e.date} ${pad(time, 12)} ${e.title}`)
    }
    console.log()
  }
}

function checkConflicts(events, fromDate, toDate) {
  const conflicts = []
  const byDate = {}
  for (const e of events) {
    if (e.date < fromDate || e.date > toDate) continue
    if (!e.startTime || !e.endTime) continue
    if (!byDate[e.date]) byDate[e.date] = []
    byDate[e.date].push(e)
  }
  for (const [date, evts] of Object.entries(byDate)) {
    evts.sort((a, b) => a.startTime.localeCompare(b.startTime))
    for (let i = 0; i < evts.length; i++) {
      for (let j = i + 1; j < evts.length; j++) {
        if (evts[j].startTime >= evts[i].endTime) break
        conflicts.push({ date, a: evts[i], b: evts[j] })
      }
    }
  }
  return conflicts
}

// ── Main ─────────────────────────────────────────────────────

function printHelp() {
  console.log(`
lifeOS Event Viewer — 快速查看某个时间段内的事件

用法:
  node scripts/events-view.mjs [选项]

时间段选项（互斥，按优先级从左到右）:
  --today              今天
  --tomorrow           明天
  --week               本周（周一 ~ 周日）
  --month              本月
  --from YYYY-MM-DD    自定义起始日期（可单独使用）
  --to YYYY-MM-DD      自定义结束日期（需配合 --from）
  （不指定则默认 --today）

筛选选项:
  --category CAT       只看指定分类 (study|health|work|social|life|other)
  --with-recurring     临时展开周期任务，不写入 events.json

展示模式（互斥）:
  （默认）             紧凑列表，按日期分组
  --timeline           时间轴视图，按时长画条
  --group              按分类分组，统计时长

其他:
  --check-conflicts     检测时间段内的时间冲突
  -h, --help           显示帮助

示例:
  node scripts/events-view.mjs --today
  node scripts/events-view.mjs --tomorrow --timeline
  node scripts/events-view.mjs --week --category study
  node scripts/events-view.mjs --from 2026-07-01 --to 2026-07-07 --group
  node scripts/events-view.mjs --today --with-recurring
  node scripts/events-view.mjs --tomorrow --check-conflicts
`)
}

const args = parseArgs(process.argv.slice(2))

if (args.h || args.help) {
  printHelp()
  process.exit(0)
}

let fromDate, toDate
if (args.today) {
  fromDate = toDate = today()
} else if (args.tomorrow) {
  fromDate = toDate = addDays(today(), 1)
} else if (args.week) {
  const r = getWeekRange(today())
  fromDate = r.from
  toDate = r.to
} else if (args.month) {
  const r = getMonthRange(today())
  fromDate = r.from
  toDate = r.to
} else if (args.from || args.to) {
  fromDate = args.from || today()
  toDate = args.to || args.from || today()
} else {
  fromDate = toDate = today()
}

const data = loadEvents()
let events = [...data.events]

if (args['with-recurring']) {
  const expanded = expandRecurring(data, fromDate, toDate)
  const existingIds = new Set(events.map((e) => e.id))
  for (const e of expanded) if (!existingIds.has(e.id)) events.push(e)
}

if (args.category) {
  events = events.filter((e) => e.category === args.category)
}

const mode = args.timeline ? 'timeline' : args.group ? 'group' : 'compact'

if (mode === 'timeline') displayTimeline(events, data.categories, fromDate, toDate)
else if (mode === 'group') displayGroup(events, data.categories, fromDate, toDate)
else displayCompact(events, data.categories, fromDate, toDate)

if (args['check-conflicts']) {
  const conflicts = checkConflicts(events, fromDate, toDate)
  console.log()
  if (conflicts.length === 0) {
    console.log(color('✅ 没有时间冲突', 'green'))
  } else {
    console.log(color(`⚠️  发现 ${conflicts.length} 个时间冲突：`, 'red'))
    for (const c of conflicts) {
      console.log(
        `  ${c.date}: ${c.a.startTime}–${c.a.endTime} ${c.a.title}  ↔  ${c.b.startTime}–${c.b.endTime} ${c.b.title}`,
      )
    }
  }
  console.log()
}