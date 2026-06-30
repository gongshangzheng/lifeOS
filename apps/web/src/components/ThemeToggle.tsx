import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切换到日间模式' : '切换到夜间模式'}
      title={isDark ? '切换到日间模式' : '切换到夜间模式'}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/40 text-zinc-400 transition-colors',
        'hover:border-indigo-500/50 hover:text-indigo-300',
      )}
    >
      {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  )
}
