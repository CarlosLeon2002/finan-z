import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppState,
  BudgetMode,
  BudgetMonth,
  Contribution,
  ExpenseCategory,
  IncomeProfile,
  SavingsGoal,
} from '../types'
import { createDefaultState } from '../domain/defaults'
import { createId } from '../lib/id'
import { clearState, getSavedAt, loadState, saveState, subscribeToStorage } from '../storage/localStore'
import { AppStateContext, type AppStateValue } from './state'

/**
 * Estado global + persistencia.
 * Cada cambio se serializa a `localStorage` en el mismo ciclo; no hay red.
 * Si la app está abierta en otra pestaña, los cambios llegan en vivo.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() ?? createDefaultState())
  const [savedAt, setSavedAt] = useState<string | null>(() => getSavedAt())
  const skipFirstSave = useRef(true)
  /** Estado recibido de otra pestaña: no se vuelve a escribir para evitar bucles. */
  const externalState = useRef<AppState | null>(null)

  useEffect(() => {
    if (externalState.current === state) {
      externalState.current = null
      return
    }
    // El primer render no escribe: lo que hay ya está guardado (o son defaults).
    if (skipFirstSave.current) {
      skipFirstSave.current = false
      return
    }
    // `saveState` escribe en localStorage (sistema externo); `savedAt` solo
    // alimenta el sello de "último guardado" que muestra Ajustes.
    // oxlint-disable-next-line react/set-state-in-effect
    if (saveState(state)) setSavedAt(new Date().toISOString())
  }, [state])

  useEffect(
    () =>
      subscribeToStorage(({ data, savedAt: incomingSavedAt }) => {
        externalState.current = data
        setState(data)
        setSavedAt(incomingSavedAt)
      }),
    [],
  )

  const setLocale = useCallback<AppStateValue['setLocale']>((locale) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, locale } }))
  }, [])

  const setCurrency = useCallback<AppStateValue['setCurrency']>((currency) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, currency } }))
  }, [])

  const setAccent = useCallback<AppStateValue['setAccent']>((accent) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, accent } }))
  }, [])

  const setThemeMode = useCallback<AppStateValue['setThemeMode']>((themeMode) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, themeMode } }))
  }, [])

  const setChartStyle = useCallback<AppStateValue['setChartStyle']>((chartStyle) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, chartStyle } }))
  }, [])

  const setIncome = useCallback((patch: Partial<IncomeProfile>) => {
    setState((previous) => ({ ...previous, income: { ...previous.income, ...patch } }))
  }, [])

  const upsertCategory = useCallback((category: ExpenseCategory) => {
    setState((previous) => {
      const exists = previous.categories.some((item) => item.id === category.id)
      return {
        ...previous,
        categories: exists
          ? previous.categories.map((item) => (item.id === category.id ? category : item))
          : [...previous.categories, category],
      }
    })
  }, [])

  const removeCategory = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      categories: previous.categories.filter((item) => item.id !== id),
    }))
  }, [])

  const saveGoal = useCallback((goal: SavingsGoal) => {
    setState((previous) => {
      const exists = previous.goals.some((item) => item.id === goal.id)
      return {
        ...previous,
        goals: exists
          ? previous.goals.map((item) => (item.id === goal.id ? goal : item))
          : [...previous.goals, goal],
      }
    })
  }, [])

  const removeGoal = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      goals: previous.goals.filter((item) => item.id !== id),
    }))
  }, [])

  const addContribution = useCallback((goalId: string, input: Omit<Contribution, 'id'>) => {
    setState((previous) => ({
      ...previous,
      goals: previous.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, contributions: [...goal.contributions, { ...input, id: createId() }] }
          : goal,
      ),
    }))
  }, [])

  const removeContribution = useCallback((goalId: string, contributionId: string) => {
    setState((previous) => ({
      ...previous,
      goals: previous.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, contributions: goal.contributions.filter((item) => item.id !== contributionId) }
          : goal,
      ),
    }))
  }, [])

  const setBudgetMode = useCallback((budgetMode: BudgetMode) => {
    setState((previous) => ({
      ...previous,
      settings: { ...previous.settings, budgetMode },
    }))
  }, [])

  const setActiveMonth = useCallback((activeMonth: string) => {
    setState((previous) => ({
      ...previous,
      settings: { ...previous.settings, activeMonth },
    }))
  }, [])

  const saveBudgetMonth = useCallback((budget: BudgetMonth) => {
    // El sello de edición se centraliza aquí para que cualquier cambio del mes
    // (ingreso, categorías o notas) quede fechado de forma consistente.
    const stamped = { ...budget, updatedAt: new Date().toISOString() }
    setState((previous) => {
      const exists = previous.budgets.some((item) => item.id === stamped.id)
      const budgets = exists
        ? previous.budgets.map((item) => (item.id === stamped.id ? stamped : item))
        : [...previous.budgets, stamped]
      return {
        ...previous,
        budgets: budgets.sort((a, b) => (a.id < b.id ? -1 : 1)),
      }
    })
  }, [])

  const removeBudgetMonth = useCallback((monthKey: string) => {
    setState((previous) => ({
      ...previous,
      budgets: previous.budgets.filter((item) => item.id !== monthKey),
      settings: {
        ...previous.settings,
        activeMonth:
          previous.settings.activeMonth === monthKey ? null : previous.settings.activeMonth,
      },
    }))
  }, [])

  const upsertBudgetCategory = useCallback((monthKey: string, category: ExpenseCategory) => {
    setState((previous) => ({
      ...previous,
      budgets: previous.budgets.map((budget) => {
        if (budget.id !== monthKey) return budget
        const exists = budget.categories.some((item) => item.id === category.id)
        return {
          ...budget,
          updatedAt: new Date().toISOString(),
          categories: exists
            ? budget.categories.map((item) => (item.id === category.id ? category : item))
            : [...budget.categories, category],
        }
      }),
    }))
  }, [])

  const removeBudgetCategory = useCallback((monthKey: string, categoryId: string) => {
    setState((previous) => ({
      ...previous,
      budgets: previous.budgets.map((budget) =>
        budget.id === monthKey
          ? {
              ...budget,
              updatedAt: new Date().toISOString(),
              categories: budget.categories.filter((item) => item.id !== categoryId),
            }
          : budget,
      ),
    }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setState((previous) =>
      previous.settings.onboardingCompletedAt
        ? previous
        : {
            ...previous,
            settings: {
              ...previous.settings,
              onboardingCompletedAt: new Date().toISOString(),
            },
          },
    )
  }, [])

  const replayOnboarding = useCallback(() => {
    setState((previous) => ({
      ...previous,
      settings: { ...previous.settings, onboardingCompletedAt: null },
    }))
  }, [])

  const replaceState = useCallback((next: AppState) => {
    setState(next)
    setSavedAt(new Date().toISOString())
  }, [])

  const resetData = useCallback(() => {
    // Preferencias (idioma/moneda) intactas: se borra solo lo financiero.
    clearState()
    setState((previous) => ({
      ...createDefaultState(),
      settings: previous.settings,
    }))
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      state,
      savedAt,
      setLocale,
      setCurrency,
      setAccent,
      setThemeMode,
      setChartStyle,
      setIncome,
      upsertCategory,
      removeCategory,
      saveGoal,
      removeGoal,
      addContribution,
      removeContribution,
      setBudgetMode,
      setActiveMonth,
      saveBudgetMonth,
      removeBudgetMonth,
      upsertBudgetCategory,
      removeBudgetCategory,
      completeOnboarding,
      replayOnboarding,
      replaceState,
      resetData,
    }),
    [
      state,
      savedAt,
      setLocale,
      setCurrency,
      setAccent,
      setThemeMode,
      setChartStyle,
      setIncome,
      upsertCategory,
      removeCategory,
      saveGoal,
      removeGoal,
      addContribution,
      removeContribution,
      setBudgetMode,
      setActiveMonth,
      saveBudgetMonth,
      removeBudgetMonth,
      upsertBudgetCategory,
      removeBudgetCategory,
      completeOnboarding,
      replayOnboarding,
      replaceState,
      resetData,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
