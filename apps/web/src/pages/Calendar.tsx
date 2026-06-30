import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventInput } from '@fullcalendar/core'
import { useEffect, useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  description?: string
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  study: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-400' },
  health: { bg: 'bg-green-500/15', border: 'border-green-500/40', text: 'text-green-400' },
  work: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400' },
  social: { bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-400' },
  life: { bg: 'bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-400' },
  other: { bg: 'bg-gray-500/15', border: 'border-gray-500/40', text: 'text-gray-400' },
}

function toFullCalendarEvents(events: CalendarEvent[]): EventInput[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startTime ? `${e.date}T${e.startTime}` : e.date,
    end: e.endTime ? `${e.date}T${e.endTime}` : undefined,
    extendedProps: {
      category: e.category ?? 'other',
      location: e.location ?? '',
      description: e.description ?? '',
    },
  }))
}

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    fetch('/lifeOS/events.json')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events ?? [])
        setLoading(false)
      })
      .catch(() => {
        setEvents([])
        setLoading(false)
      })
  }, [])

  const fcEvents = toFullCalendarEvents(events)

  const today = new Date().toISOString().slice(0, 10)
  const todayEvents = events.filter((e) => e.date === today)

  return (
    <section className="space-y-4">
      <h1 className="lo-section-title">Calendar</h1>

      {/* Today's events */}
      {todayEvents.length > 0 && (
        <div className="lo-card p-4">
          <h2 className="text-sm font-semibold text-heading">今日事件（{today}）</h2>
          <div className="mt-3 space-y-2">
            {todayEvents.map((e) => {
              const colors = CATEGORY_COLORS[e.category ?? 'other'] ?? CATEGORY_COLORS.other
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 rounded-md border ${colors.border} ${colors.bg} p-3`}
                >
                  <div className={`text-xs font-medium ${colors.text}`}>
                    {e.startTime ?? '—'} – {e.endTime ?? '—'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-body">{e.title}</div>
                    {e.location && <div className="text-xs text-dim">{e.location}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="lo-card lo-calendar p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-dim">加载中…</div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridThreeDay"
            views={{
              timeGridThreeDay: {
                type: 'timeGrid',
                duration: { days: 3 },
                buttonText: '3日',
              },
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridThreeDay,timeGridDay,listWeek',
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
            nowIndicator
            events={fcEvents}
            height="auto"
            eventDisplay="block"
            eventClick={(info) => {
              const evt = events.find((e) => e.id === info.event.id)
              if (evt) setSelectedEvent(evt)
            }}
            eventContent={(arg) => {
              const cat = arg.event.extendedProps.category as string
              const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other
              const isPast = arg.event.end ? arg.event.end < new Date() : false
              const isOngoing =
                !isPast &&
                arg.event.start &&
                arg.event.start <= new Date() &&
                (!arg.event.end || arg.event.end > new Date())
              const stateClass = isPast
                ? 'fc-event-past'
                : isOngoing
                  ? 'fc-event-ongoing'
                  : 'fc-event-future'
              return (
                <div
                  className={`rounded px-1 py-0.5 text-xs ${colors.bg} ${stateClass}`}
                >
                  {arg.event.title}
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="lo-card mx-4 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-heading">{selectedEvent.title}</h3>
            <div className="mt-3 space-y-2 text-sm text-body">
              <div>
                <span className="text-dim">时间：</span>
                {selectedEvent.startTime ?? '—'} – {selectedEvent.endTime ?? '—'}
              </div>
              {selectedEvent.location && (
                <div>
                  <span className="text-dim">地点：</span>
                  {selectedEvent.location}
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <span className="text-dim">备注：</span>
                  {selectedEvent.description}
                </div>
              )}
            </div>
            <button
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => setSelectedEvent(null)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
