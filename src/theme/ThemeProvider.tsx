import { useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { useAppState } from '../app/state'
import { accentColors } from './accents'
import { ThemeContext, type ResolvedTheme, type ThemeValue } from './theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getSystemIsDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches
}

/**
 * Resuelve el tema (la preferencia `auto` sigue al sistema) y lo aplica al
 * `<html>` antes del pintado:
 *  - `data-theme` y `color-scheme` → neutros y semánticos (definidos en la CSS).
 *  - los tokens `--color-primary*` → en línea desde la paleta del acento,
 *    de modo que interfaz y gráficas siempre coinciden.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state } = useAppState()
  const { themeMode, accent } = state.settings

  const systemIsDark = useSyncExternalStore(subscribeSystemTheme, getSystemIsDark, () => false)
  const isDark = themeMode === 'auto' ? systemIsDark : themeMode === 'dark'
  const resolvedTheme: ResolvedTheme = isDark ? 'dark' : 'light'

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolvedTheme
    root.dataset.accent = accent
    root.style.colorScheme = resolvedTheme

    const colors = accentColors(accent, isDark)
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-strong', colors.strong)
    root.style.setProperty('--color-primary-soft', colors.soft)
    root.style.setProperty('--color-on-primary-soft', colors.onSoft)

    // El color de la barra del navegador sigue al acento activo.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', colors.primary)
  }, [resolvedTheme, accent, isDark])

  const value = useMemo<ThemeValue>(
    () => ({ themeMode, accent, resolvedTheme, isDark }),
    [themeMode, accent, resolvedTheme, isDark],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
