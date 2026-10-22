import { createContext, useContext } from 'react'
import type {
  AccentId,
  AppState,
  BudgetMode,
  BudgetMonth,
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
  /** Cambia entre presupuesto fijo y presupuestos independientes por mes. */
  setBudgetMode: (mode: BudgetMode) => void
  /** Selecciona el mes visible en modo variable (`YYYY-MM`). */
  setActiveMonth: (monthKey: string) => void
  /** Crea o actualiza el presupuesto de un mes. */
  saveBudgetMonth: (budget: BudgetMonth) => void
  removeBudgetMonth: (monthKey: string) => void
  upsertBudgetCategory: (monthKey: string, category: ExpenseCategory) => void
  removeBudgetCategory: (monthKey: string, categoryId: string) => void
  /** Marca la introducción como completada (o saltada). */
  completeOnboarding: () => void
  /** Vuelve a abrir la introducción sin borrar datos. */
  replayOnboarding: () => void
  /** Restaura un estado completo validado (importación de respaldo). */
  replaceState: (state: AppState) => void
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
