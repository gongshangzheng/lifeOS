import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { getAllDaily } from '@/content/loader'

export function CalendarPage() {
  const events = getAllDaily()
    .filter((d) => d.date)
    .map((d) => ({ id: d.slug, title: d.title, date: d.date!.slice(0, 10) }))
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Calendar</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      </div>
    </section>
  )
}
