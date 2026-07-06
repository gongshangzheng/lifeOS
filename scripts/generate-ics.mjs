#!/usr/bin/env node
// ============================================================
// lifeOS ICS Calendar Export
// ============================================================
// Generates a standard iCalendar (.ics) file from events.json.
// Output: apps/web/public/calendar.ics
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EVENTS_FILE = resolve(__dirname, '../apps/web/public/events.json')
const ICS_FILE = resolve(__dirname, '../apps/web/public/calendar.ics')

// ── Helpers ──────────────────────────────────────────────────

function toICSDate(date, time) {
  // Format: YYYYMMDDTHHMMSSZ
  if (!time) {
    // All-day event: YYYYMMDD
    return date.replace(/-/g, '')
  }
  const [h, m] = time.split(':')
  const d = new Date(`${date}T${time}:00`)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeICS(text) {
  if (!text) return ''
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function generateUID(id, date) {
  return `lifeos-${id}-${date}@gongshangzheng.github.io`
}

// ── Main ─────────────────────────────────────────────────────

function main() {
  let data
  try {
    data = JSON.parse(readFileSync(EVENTS_FILE, 'utf-8'))
  } catch {
    console.log('No events.json found, skipping ICS generation.')
    return
  }

  const events = data.events ?? []
  if (events.length === 0) {
    console.log('No events to export.')
    return
  }

  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//lifeOS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:lifeOS`,
    `X-WR-TIMEZONE:Asia/Shanghai`,
  ]

  for (const e of events) {
    const uid = generateUID(e.id, e.date)
    const dtstart = toICSDate(e.date, e.startTime)
    const dtend = e.endTime ? toICSDate(e.date, e.endTime) : undefined
    const isAllDay = !e.startTime

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${now}`)

    if (isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`)
    } else {
      lines.push(`DTSTART:${dtstart}`)
      if (dtend) lines.push(`DTEND:${dtend}`)
    }

    lines.push(`SUMMARY:${escapeICS(e.title)}`)
    if (e.location) lines.push(`LOCATION:${escapeICS(e.location)}`)
    if (e.description) lines.push(`DESCRIPTION:${escapeICS(e.description)}`)
    if (e.category) lines.push(`CATEGORIES:${e.category}`)

    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  writeFileSync(ICS_FILE, lines.join('\r\n'), 'utf-8')
  console.log(`Generated ${ICS_FILE} with ${events.length} events.`)
}

main()
