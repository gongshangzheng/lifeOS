import { Routes, Route, NavLink, Outlet, Navigate, Link } from 'react-router-dom'
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
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Home } from '@/pages/Home'
import { CalendarPage } from '@/pages/Calendar'
import {
  DailyList,
  DailyDetail,
  WeeklyList,
  WeeklyDetail,
  MonthlyList,
  MonthlyDetail,
  QuarterlyList,
  QuarterlyDetail,
  AnnualList,
  AnnualDetail,
  VisionList,
  VisionDetail,
  AppendixList,
  AppendixDetail,
} from '@/pages/ReportPages'

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
    <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link to="/" className="mr-4 flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-indigo-500 text-zinc-50">
            <span className="text-xs font-bold">L</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-100">lifeOS</span>
        </Link>
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
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[10px] uppercase tracking-widest text-zinc-500 sm:inline">
            v0.1
          </span>
          <ThemeToggle />
        </div>
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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calendar" element={<CalendarPage />} />

        <Route path="daily" element={<DailyList />} />
        <Route path="daily/:slug" element={<DailyDetail />} />

        <Route path="weekly" element={<WeeklyList />} />
        <Route path="weekly/:slug" element={<WeeklyDetail />} />

        <Route path="monthly" element={<MonthlyList />} />
        <Route path="monthly/:slug" element={<MonthlyDetail />} />

        <Route path="quarterly" element={<QuarterlyList />} />
        <Route path="quarterly/:slug" element={<QuarterlyDetail />} />

        <Route path="annual" element={<AnnualList />} />
        <Route path="annual/:slug" element={<AnnualDetail />} />

        <Route path="vision" element={<VisionList />} />
        <Route path="vision/:slug" element={<VisionDetail />} />

        <Route path="appendix" element={<AppendixList />} />
        <Route path="appendix/:slug" element={<AppendixDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
