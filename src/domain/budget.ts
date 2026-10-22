import type { AppState, BudgetMonth, ExpenseCategory, Locale } from '../types'
import { createId } from '../lib/id'
import { DEFAULT_CATEGORY_PRESETS, createCategory } from './partition'

/**
 * Presupuestos por mes.
 *
 * En modo `fixed` se usa el ingreso y la partición únicos de la app. En modo
 * `variable` cada mes tiene su propio ingreso, categorías y montos: crear o
 * editar un mes nunca copia ni modifica los demás.
 */

export function currentMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function parseMonthKey(key: string): Date {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, 1)
}

/** Desplaza un mes conservando el calendario (sin desbordes de día). */
export function shiftMonth(key: string, delta: number): string {
  const date = parseMonthKey(key)
  date.setMonth(date.getMonth() + delta)
  return currentMonthKey(date)
}

/** Nombre largo del mes en el idioma activo. */
export function monthLabel(key: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(parseMonthKey(key))
}

export interface BudgetView {
  income: number
  categories: ExpenseCategory[]
  /** `null` en modo fijo. */
  monthKey: string | null
  month: BudgetMonth | null
  isVariable: boolean
  /** Mes variable todavía sin presupuesto (o modo fijo sin datos). */
  isEmpty: boolean
}

/** Resuelve el presupuesto que debe verse en el Panel y en Partición. */
export function resolveBudget(state: AppState, now: Date = new Date()): BudgetView {
  if (state.settings.budgetMode === 'fixed') {
    return {
      income: state.income.netAmount,
      categories: state.categories,
      monthKey: null,
      month: null,
      isVariable: false,
      isEmpty: false,
    }
  }

  const key = state.settings.activeMonth ?? currentMonthKey(now)
  const month = state.budgets.find((budget) => budget.id === key) ?? null

  return {
    income: month?.income ?? 0,
    categories: month?.categories ?? [],
    monthKey: key,
    month,
    isVariable: true,
    isEmpty: !month,
  }
}

/**
 * Crea un mes nuevo. `template` aporta nombres, emojis y colores; los montos
 * solo se copian si `copyAmounts` es true (primer mes al migrar desde fijo).
 */
export function createMonthBudget(
  key: string,
  income: number,
  template: ExpenseCategory[],
  copyAmounts: boolean,
): BudgetMonth {
  const source =
    template.length > 0
      ? template
      : DEFAULT_CATEGORY_PRESETS.map((preset) => createCategory(preset))

  return {
    id: key,
    income: Math.max(0, copyAmounts ? income : 0),
    note: '',
    categories: source.map((category) => ({
      ...category,
      id: createId(),
      amount: copyAmounts ? Math.max(0, category.amount) : 0,
    })),
    updatedAt: new Date().toISOString(),
  }
}
