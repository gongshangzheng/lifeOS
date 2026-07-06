import { Routes, Route, NavLink, Outlet, Navigate, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  CalendarDays,
  NotebookPen,
  CalendarRange,
  Calendar as CalendarIcon,
  Target,
  Compass,
  BookOpen,
  Library,
  FolderKanban,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchModal, SearchButton } from '@/components/SearchModal'
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
import { ProjectsPage } from '@/pages/Projects'
import { HabitsPage } from '@/pages/Habits'

const NAV: ReadonlyArray<{ to: string; label: string; icon: typeof CalendarDays }> = [
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/habits', label: 'Habits', icon: Activity },
  { to: '/daily', label: 'Daily', icon: NotebookPen },
  { to: '/weekly', label: 'Weekly', icon: CalendarRange },
  { to: '/monthly', label: 'Monthly', icon: CalendarIcon },
  { to: '/quarterly', label: 'Quarterly', icon: Target },
  { to: '/annual', label: 'Annual', icon: BookOpen },
  { to: '/vision', label: 'Vision', icon: Compass },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/appendix', label: 'Appendix', icon: Library },
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
        <Outlet />
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

        <Route path="projects" element={<ProjectsPage />} />

        <Route path="appendix" element={<AppendixList />} />
        <Route path="appendix/:slug" element={<AppendixDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
