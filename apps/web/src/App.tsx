import { useEffect, useState, type ReactNode } from 'react'
import { Routes, Route, NavLink, Outlet, Navigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  CalendarRange,
  Calendar as CalendarIcon,
  Target,
  Compass,
  BookOpen,
  Library,
} from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { cn } from '@/lib/utils'
import { getAllDaily, getDailyBySlug } from '@/content/loader'

const NAV: ReadonlyArray<{ to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }> = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/daily', label: 'Daily', icon: NotebookPen },
  { to: '/weekly', label: 'Weekly', icon: CalendarRange },
  { to: '/monthly', label: 'Monthly', icon: CalendarIcon },
  { to: '/quarterly', label: 'Quarterly', icon: Target },
  { to: '/annual', label: 'Annual', icon: BookOpen },
  { to: '/vision', label: 'Vision', icon: Compass },
  { to: '/appendix', label: 'Appendix', icon: Library },
]

function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <div className="mr-4 flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-indigo-500 text-zinc-50">
            <span className="text-xs font-bold">L</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-100">lifeOS</span>
        </div>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto text-[10px] uppercase tracking-widest text-zinc-500">v0.1</div>
      </div>
    </header>
  )
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800/60 py-4 text-center text-xs text-zinc-500">
        lifeOS — a personal life operating system
      </footer>
    </div>
  )
}

function Page({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
      <div className="text-zinc-400">{children}</div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-100">{value}</div>
    </div>
  )
}

function Home() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const dailyCount = getAllDaily().length

  return (
    <Page title="lifeOS Dashboard">
      <p className="text-sm text-zinc-500">当前时间</p>
      <p className="font-mono text-3xl text-zinc-100">
        {now.toLocaleString('zh-CN', { hour12: false })}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Daily" value={dailyCount} />
        <Stat label="Streak" value="—" />
        <Stat label="Focus" value="—%" />
        <Stat label="Status" value="Online" />
      </div>
    </Page>
  )
}

function CalendarPage() {
  const events = getAllDaily()
    .filter((d) => d.date)
    .map((d) => ({ id: d.slug, title: d.title, date: d.date!.slice(0, 10) }))
  return (
    <Page title="Calendar">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      </div>
    </Page>
  )
}

function DailyList() {
  const items = getAllDaily()
  return (
    <Page title="Daily Reports">
      {items.length === 0 ? (
        <p className="text-zinc-500">还没有日报。</p>
      ) : (
        <ul className="space-y-2">
          {items.map((d) => (
            <li key={d.slug}>
              <NavLink
                to={`/daily/${d.slug}`}
                className="block rounded-md border border-zinc-800 bg-zinc-900/40 p-3 transition-colors hover:border-indigo-500/50 hover:bg-zinc-900"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-zinc-100">{d.title}</span>
                  <span className="text-xs text-zinc-500">{d.date?.slice(0, 10)}</span>
                </div>
                {d.summary && <p className="mt-1 text-sm text-zinc-400">{d.summary}</p>}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}

function DailyDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const item = getDailyBySlug(slug)
  if (!item) {
    return (
      <Page title="未找到">
        <p>
          没有找到 slug 为 <code className="text-indigo-300">{slug}</code> 的日报。
        </p>
      </Page>
    )
  }
  return (
    <Page title={item.title}>
      {item.date && <p className="text-xs text-zinc-500">{item.date.slice(0, 10)}</p>}
      {item.summary && <p className="text-zinc-300">{item.summary}</p>}
      <pre className="mt-4 whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
        {item.body}
      </pre>
    </Page>
  )
}

function ListPage({
  title,
  empty,
}: {
  title: string
  empty: string
}) {
  return (
    <Page title={title}>
      <p className="text-zinc-500">{empty}</p>
    </Page>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="daily" element={<DailyList />} />
        <Route path="daily/:slug" element={<DailyDetail />} />
        <Route
          path="weekly"
          element={<ListPage title="Weekly Reports" empty="还没有周报。" />}
        />
        <Route
          path="monthly"
          element={<ListPage title="Monthly Reports" empty="还没有月报。" />}
        />
        <Route
          path="quarterly"
          element={<ListPage title="Quarterly Reports" empty="还没有季报。" />}
        />
        <Route
          path="annual"
          element={<ListPage title="Annual Reports" empty="还没有年报。" />}
        />
        <Route path="vision" element={<ListPage title="Vision" empty="还没有愿景文档。" />} />
        <Route
          path="appendix"
          element={<ListPage title="Appendix" empty="还没有附录。" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
