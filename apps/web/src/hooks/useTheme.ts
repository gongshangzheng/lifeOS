import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'lifeos.theme'

export type Theme = 'dark' | 'light'

function readInitial(): Theme {
  if (typeof document === 'undefined') return 'dark'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage may be unavailable (private mode, restricted iframe, …)
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  }
  // Final fallback: the inline boot script in index.html already decided
  // for us, so mirror what it picked.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function apply(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore — best-effort persistence
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitial)

  // Sync once on mount to align the React state with the DOM class set
  // by the inline boot script.
  useEffect(() => {
    apply(theme)
    // theme is intentionally not a dep — we only sync on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow system preference if the user has never picked one.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return
      } catch {
        // ignore
      }
      const next: Theme = e.matches ? 'dark' : 'light'
      setTheme(next)
      apply(next)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      apply(next)
      return next
    })
  }, [])

  const set = useCallback((next: Theme) => {
    apply(next)
    setTheme(next)
  }, [])

  return { theme, toggle, setTheme: set } as const
}
