import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'lifeos.theme'
type Theme = 'dark' | 'light'

function readInitial(): Theme {
  if (typeof document === 'undefined') return 'dark'
  // The default is set in main.tsx (adds `dark` to <html>). If the user
  // previously chose light, localStorage will say so and we flip immediately.
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage may be unavailable (private mode, restricted iframe, …)
  }
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitial)

  // Sync once on mount in case the saved value differs from what main.tsx
  // assumed at first paint.
  useEffect(() => {
    apply(theme)
    // theme is intentionally not a dep — we only sync on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      apply(next)
      return next
    })
  }, [])

  return { theme, toggle, setTheme } as const
}
