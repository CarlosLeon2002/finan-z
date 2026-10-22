import { createContext, useContext } from 'react'
import type { AccentId, ThemeMode } from '../types'

export type ResolvedTheme = 'light' | 'dark'

/**
 * Tema activo ya resuelto. `themeMode` es la preferencia guardada (`auto`
 * sigue al sistema); `resolvedTheme`/`isDark` son el resultado concreto que
 * usan las gráficas (que pintan sobre canvas y no leen la CSS).
 */
export interface ThemeValue {
  themeMode: ThemeMode
  accent: AccentId
  resolvedTheme: ResolvedTheme
  isDark: boolean
}

export const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme(): ThemeValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  }
  return context
}
