import { Routes, Route, NavLink, Outlet, Navigate, Link } from 'react-router-dom'
import { useState, lazy, Suspense } from 'react'
import {
  CalendarDays,
  FolderKanban,
  Activity,
  FileText,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchModal, SearchButton } from '@/components/SearchModal'

// ── Lazy-loaded pages (route-level code splitting) ──────────
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })))
const CalendarPage = lazy(() => import('@/pages/Calendar').then((m) => ({ default: m.CalendarPage })))
const ProjectsPage = lazy(() => import('@/pages/Projects').then((m) => ({ default: m.ProjectsPage })))
const HabitsPage = lazy(() => import('@/pages/Habits').then((m) => ({ default: m.HabitsPage })))

const rp = () => import('@/pages/ReportPages')
const DailyList = lazy(() => rp().then((m) => ({ default: m.DailyList })))
const DailyDetail = lazy(() => rp().then((m) => ({ default: m.DailyDetail })))
const WeeklyList = lazy(() => rp().then((m) => ({ default: m.WeeklyList })))
const WeeklyDetail = lazy(() => rp().then((m) => ({ default: m.WeeklyDetail })))
const MonthlyList = lazy(() => rp().then((m) => ({ default: m.MonthlyList })))
const MonthlyDetail = lazy(() => rp().then((m) => ({ default: m.MonthlyDetail })))
const QuarterlyList = lazy(() => rp().then((m) => ({ default: m.QuarterlyList })))
const QuarterlyDetail = lazy(() => rp().then((m) => ({ default: m.QuarterlyDetail })))
const AnnualList = lazy(() => rp().then((m) => ({ default: m.AnnualList })))
const AnnualDetail = lazy(() => rp().then((m) => ({ default: m.AnnualDetail })))
const VisionList = lazy(() => rp().then((m) => ({ default: m.VisionList })))
const VisionDetail = lazy(() => rp().then((m) => ({ default: m.VisionDetail })))
const AppendixList = lazy(() => rp().then((m) => ({ default: m.AppendixList })))
const AppendixDetail = lazy(() => rp().then((m) => ({ default: m.AppendixDetail })))
const FirstTimesPage = lazy(() => import('@/pages/FirstTimes').then((m) => ({ default: m.FirstTimesPage })))

const NAV: ReadonlyArray<{ to: string; label: string; icon: typeof CalendarDays }> = [
  { to: '/calendar', label: '日历', icon: CalendarDays },
  { to: '/projects', label: '项目', icon: FolderKanban },
  { to: '/report', label: '报告', icon: FileText },
  { to: '/habits', label: '习惯', icon: Activity },
  { to: '/first-times', label: '初体验', icon: Sparkles },
]

function NavBar() {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <>
      <header className="lo-nav">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <Link to="/" className="mr-4 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <span className="text-xs font-bold">L</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-heading">lifeOS</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary-subtle text-primary-subtle-foreground'
                      : 'text-dim hover:bg-muted hover:text-heading',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SearchButton onClick={() => setSearchOpen(true)} />
            <span className="hidden text-[10px] uppercase tracking-widest text-placeholder sm:inline">
              v0.1
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Suspense fallback={<div className="flex items-center justify-center py-20 text-sm text-dim">加载中…</div>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="lo-footer">lifeOS — a personal life operating system</footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calendar" element={<CalendarPage />} />

        <Route path="habits" element={<HabitsPage />} />

        <Route path="projects" element={<ProjectsPage />} />

        {/* 报告页面 - 包含所有子类型 */}
        <Route path="report" element={<DailyList />} />
        <Route path="report/daily" element={<DailyList />} />
        <Route path="report/daily/:slug" element={<DailyDetail />} />
        <Route path="report/weekly" element={<WeeklyList />} />
        <Route path="report/weekly/:slug" element={<WeeklyDetail />} />
        <Route path="report/monthly" element={<MonthlyList />} />
        <Route path="report/monthly/:slug" element={<MonthlyDetail />} />
        <Route path="report/quarterly" element={<QuarterlyList />} />
        <Route path="report/quarterly/:slug" element={<QuarterlyDetail />} />
        <Route path="report/annual" element={<AnnualList />} />
        <Route path="report/annual/:slug" element={<AnnualDetail />} />
        <Route path="report/vision" element={<VisionList />} />
        <Route path="report/vision/:slug" element={<VisionDetail />} />
        <Route path="report/appendix" element={<AppendixList />} />
        <Route path="report/appendix/:slug" element={<AppendixDetail />} />

        <Route path="first-times" element={<FirstTimesPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
