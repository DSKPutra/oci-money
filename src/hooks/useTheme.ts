import { useEffect } from 'react'
import type { ThemeMode } from '../types'
import { useLocalStorage } from './useLocalStorage'

function getSystemTheme(): ThemeMode {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeMode | null>('oci-money-theme', null)
  const resolved = theme ?? getSystemTheme()

  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolved])

  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark')

  return { theme: resolved, setTheme, toggleTheme }
}
