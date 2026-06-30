import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventInput } from '@fullcalendar/core'
import { getAllDaily } from '@/content/loader'

export function CalendarPage() {
  const events: EventInput[] = getAllDaily()
    .filter((d) => d.date)
    .map((d) => ({
      id: d.slug,
      title: d.title,
      date: d.date!.slice(0, 10),
    }))

  return (
    <section className="space-y-4">
      <h1 className="lo-section-title">Calendar</h1>
      <div className="lo-card lo-calendar p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          buttonText={{
            today: '今天',
            month: '月',
            week: '周',
            day: '日',
            list: '列表',
          }}
          locale="zh-cn"
          firstDay={1}
          events={events}
          height="auto"
          eventDisplay="list-item"
        />
      </div>
    </section>
  )
}
