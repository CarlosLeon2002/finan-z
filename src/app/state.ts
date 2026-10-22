import { createContext, useContext } from 'react'
import type {
  AccentId,
  AppState,
  ChartStyle,
  Contribution,
  CurrencyCode,
  ExpenseCategory,
  IncomeProfile,
  Locale,
  SavingsGoal,
  ThemeMode,
} from '../types'

/**
 * Contrato del estado global. La implementación (provider + persistencia)
 * vive en `StateProvider.tsx`; aquí solo está el contexto y su hook.
 */
export interface AppStateValue {
  state: AppState
  /** ISO de la última escritura exitosa en el dispositivo (`null` si nunca). */
  savedAt: string | null
  setLocale: (locale: Locale) => void
  setCurrency: (currency: CurrencyCode) => void
  setAccent: (accent: AccentId) => void
  setThemeMode: (mode: ThemeMode) => void
  setChartStyle: (style: ChartStyle) => void
  setIncome: (patch: Partial<IncomeProfile>) => void
  upsertCategory: (category: ExpenseCategory) => void
  removeCategory: (id: string) => void
  /** Crea la meta o actualiza una existente (mismo `id`). */
  saveGoal: (goal: SavingsGoal) => void
  removeGoal: (id: string) => void
  addContribution: (goalId: string, input: Omit<Contribution, 'id'>) => void
  removeContribution: (goalId: string, contributionId: string) => void
  /** Borra los datos financieros y conserva las preferencias. */
  resetData: () => void
}

export const AppStateContext = createContext<AppStateValue | null>(null)

export function useAppState(): AppStateValue {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState debe usarse dentro de <AppStateProvider>')
  }
  return context
}
