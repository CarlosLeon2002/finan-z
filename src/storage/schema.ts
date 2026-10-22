import type {
  AppState,
  BudgetMonth,
  CategoryPreset,
  Contribution,
  ExpenseCategory,
  GoalHorizon,
  IncomeProfile,
  ObjectiveKey,
  PayFrequency,
  SavingsGoal,
  Settings,
} from '../types'
import { ACCENT_IDS, CHART_STYLES, CURRENCY_CODES } from '../types'
import { createDefaultState } from '../domain/defaults'

/**
 * Validación del estado guardado y de los respaldos.
 *
 * Hay dos niveles deliberadamente distintos:
 * - `parseAppState` es estricto: se usa al importar un `.txt`. Cualquier campo
 *   fuera de rango, fecha imposible o tipo incorrecto rechaza el archivo
 *   completo antes de tocar los datos actuales.
 * - `normalizeStoredState` es tolerante: completa preferencias nuevas en
 *   registros antiguos de `localStorage` sin perder información.
 */

export type SchemaError =
  | 'state'
  | 'settings'
  | 'income'
  | 'categories'
  | 'goals'
  | 'budgets'

export type SchemaResult<T> = { ok: true; value: T } | { ok: false; error: SchemaError }

const CATEGORY_PRESETS: readonly CategoryPreset[] = [
  'housing',
  'utilities',
  'cards',
  'food',
  'transport',
  'health',
  'education',
  'leisure',
  'savings',
  'debt',
  'personal',
  'other',
  'custom',
]

const OBJECTIVES: readonly ObjectiveKey[] = [
  'vehicle',
  'phone',
  'tools',
  'investment',
  'home',
  'travel',
  'education',
  'emergency',
  'debt',
  'custom',
]

const FREQUENCIES: readonly PayFrequency[] = ['weekly', 'biweekly', 'monthly', 'custom']
const THEME_MODES = ['auto', 'light', 'dark'] as const
const BUDGET_MODES = ['fixed', 'variable'] as const
const LOCALES = ['es-419', 'en-US'] as const
const HORIZON_UNITS = ['days', 'months', 'years'] as const

const MAX_AMOUNT = 1_000_000_000_000
const MAX_CATEGORIES = 200
const MAX_GOALS = 200
const MAX_CONTRIBUTIONS = 5000
const MAX_BUDGETS = 240
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const COLOR_RE = /^#[0-9a-f]{6}$/i

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

function isText(value: unknown, min: number, max: number): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max
}

function isAmount(value: unknown, min = 0): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= MAX_AMOUNT
  )
}

function isInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && MONTH_RE.test(value)
}

export function isISODate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  )
}

export function isISODateTime(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 40 &&
    !Number.isNaN(new Date(value).getTime())
  )
}

function parseCategory(value: unknown): ExpenseCategory | null {
  if (!isRecord(value)) return null
  if (!isText(value.id, 1, 80)) return null
  if (!oneOf(value.preset, CATEGORY_PRESETS)) return null
  if (!isText(value.label, 0, 120) && value.label !== '') return null
  if (typeof value.label !== 'string' || value.label.length > 120) return null
  if (!isText(value.emoji, 1, 32)) return null
  if (typeof value.color !== 'string' || !COLOR_RE.test(value.color)) return null
  if (!isAmount(value.amount)) return null

  return {
    id: value.id,
    preset: value.preset,
    label: value.label,
    emoji: value.emoji,
    color: value.color,
    amount: value.amount,
  }
}

function parseCategories(value: unknown): ExpenseCategory[] | null {
  if (!Array.isArray(value) || value.length > MAX_CATEGORIES) return null
  const seen = new Set<string>()
  const categories: ExpenseCategory[] = []

  for (const item of value) {
    const category = parseCategory(item)
    if (!category || seen.has(category.id)) return null
    seen.add(category.id)
    categories.push(category)
  }
  return categories
}

function parseIncome(value: unknown): IncomeProfile | null {
  if (!isRecord(value)) return null
  if (!isAmount(value.netAmount)) return null
  if (!oneOf(value.payFrequency, FREQUENCIES)) return null
  if (!isISODate(value.paydayDate)) return null
  if (!isInteger(value.customIntervalDays, 1, 365)) return null

  return {
    netAmount: value.netAmount,
    payFrequency: value.payFrequency,
    paydayDate: value.paydayDate,
    customIntervalDays: value.customIntervalDays,
  }
}

function parseHorizon(value: unknown): GoalHorizon | null {
  if (!isRecord(value)) return null

  if (value.mode === 'calendar') {
    if (!oneOf(value.unit, HORIZON_UNITS)) return null
    if (!isAmount(value.value, 0.01) || value.value > 1000) return null
    return { mode: 'calendar', unit: value.unit, value: value.value }
  }

  if (value.mode === 'payday') {
    if (!oneOf(value.payFrequency, FREQUENCIES)) return null
    if (!isInteger(value.payments, 1, 1000)) return null
    if (!isInteger(value.customIntervalDays, 1, 365)) return null
    return {
      mode: 'payday',
      payFrequency: value.payFrequency,
      payments: value.payments,
      customIntervalDays: value.customIntervalDays,
    }
  }

  return null
}

function parseContribution(value: unknown): Contribution | null {
  if (!isRecord(value)) return null
  if (!isText(value.id, 1, 80)) return null
  if (!isISODate(value.date)) return null
  if (!isAmount(value.amount)) return null
  return { id: value.id, date: value.date, amount: value.amount }
}

function parseGoal(value: unknown): SavingsGoal | null {
  if (!isRecord(value)) return null
  if (!isText(value.id, 1, 80)) return null
  if (!isText(value.title, 1, 160)) return null
  if (!oneOf(value.objective, OBJECTIVES)) return null
  if (!isAmount(value.targetAmount, 0.01)) return null
  if (!isAmount(value.initialAmount)) return null
  if (!isISODate(value.startDate)) return null
  if (!isText(value.methodId, 1, 80)) return null
  if (!isISODateTime(value.createdAt)) return null

  const horizon = parseHorizon(value.horizon)
  if (!horizon) return null

  if (!Array.isArray(value.contributions) || value.contributions.length > MAX_CONTRIBUTIONS) {
    return null
  }

  const seen = new Set<string>()
  const contributions: Contribution[] = []
  for (const item of value.contributions) {
    const contribution = parseContribution(item)
    if (!contribution || seen.has(contribution.id)) return null
    seen.add(contribution.id)
    contributions.push(contribution)
  }

  return {
    id: value.id,
    title: value.title,
    objective: value.objective,
    targetAmount: value.targetAmount,
    initialAmount: value.initialAmount,
    startDate: value.startDate,
    methodId: value.methodId,
    horizon,
    contributions,
    createdAt: value.createdAt,
  }
}

function parseGoals(value: unknown): SavingsGoal[] | null {
  if (!Array.isArray(value) || value.length > MAX_GOALS) return null
  const seen = new Set<string>()
  const goals: SavingsGoal[] = []

  for (const item of value) {
    const goal = parseGoal(item)
    if (!goal || seen.has(goal.id)) return null
    seen.add(goal.id)
    goals.push(goal)
  }
  return goals
}

function parseBudgetMonth(value: unknown): BudgetMonth | null {
  if (!isRecord(value)) return null
  if (!isMonthKey(value.id)) return null
  if (!isAmount(value.income)) return null
  if (typeof value.note !== 'string' || value.note.length > 200) return null
  if (!isISODateTime(value.updatedAt)) return null

  const categories = parseCategories(value.categories)
  if (!categories) return null

  return {
    id: value.id,
    income: value.income,
    categories,
    note: value.note,
    updatedAt: value.updatedAt,
  }
}

function parseBudgets(value: unknown): BudgetMonth[] | null {
  if (!Array.isArray(value) || value.length > MAX_BUDGETS) return null
  const seen = new Set<string>()
  const budgets: BudgetMonth[] = []

  for (const item of value) {
    const budget = parseBudgetMonth(item)
    if (!budget || seen.has(budget.id)) return null
    seen.add(budget.id)
    budgets.push(budget)
  }
  return budgets.sort((a, b) => (a.id < b.id ? -1 : 1))
}

function parseSettings(value: unknown): Settings | null {
  if (!isRecord(value)) return null
  if (value.locale !== null && !oneOf(value.locale, LOCALES)) return null
  if (!oneOf(value.currency, CURRENCY_CODES)) return null
  if (!oneOf(value.accent, ACCENT_IDS)) return null
  if (!oneOf(value.themeMode, THEME_MODES)) return null
  if (!oneOf(value.chartStyle, CHART_STYLES)) return null
  if (value.onboardingCompletedAt !== null && !isISODateTime(value.onboardingCompletedAt)) {
    return null
  }
  if (!oneOf(value.budgetMode, BUDGET_MODES)) return null
  if (value.activeMonth !== null && !isMonthKey(value.activeMonth)) return null

  return {
    locale: value.locale,
    currency: value.currency,
    accent: value.accent,
    themeMode: value.themeMode,
    chartStyle: value.chartStyle,
    onboardingCompletedAt: value.onboardingCompletedAt,
    budgetMode: value.budgetMode,
    activeMonth: value.activeMonth,
  }
}

/** Validación estricta de un estado completo (usada al importar un respaldo). */
export function parseAppState(value: unknown): SchemaResult<AppState> {
  if (!isRecord(value) || value.version !== 1) return { ok: false, error: 'state' }

  const settings = parseSettings(value.settings)
  if (!settings) return { ok: false, error: 'settings' }

  const income = parseIncome(value.income)
  if (!income) return { ok: false, error: 'income' }

  const categories = parseCategories(value.categories)
  if (!categories) return { ok: false, error: 'categories' }

  const goals = parseGoals(value.goals)
  if (!goals) return { ok: false, error: 'goals' }

  const budgets = parseBudgets(value.budgets)
  if (!budgets) return { ok: false, error: 'budgets' }

  return {
    ok: true,
    value: {
      version: 1,
      settings,
      income,
      categories,
      goals,
      budgets,
    },
  }
}

/**
 * Lectura tolerante de `localStorage`: mantiene datos antiguos y añade las
 * preferencias creadas después (onboarding, modo de presupuesto y meses).
 */
export function normalizeStoredState(value: unknown): AppState | null {
  if (!isRecord(value)) return null

  const defaults = createDefaultState()
  const rawSettings = isRecord(value.settings) ? value.settings : {}
  const hasOnboarding = Object.prototype.hasOwnProperty.call(
    rawSettings,
    'onboardingCompletedAt',
  )

  const accentOk = oneOf(rawSettings.accent, ACCENT_IDS)
  const themeOk = oneOf(rawSettings.themeMode, THEME_MODES)
  const chartOk = oneOf(rawSettings.chartStyle, CHART_STYLES)
  const budgetModeOk = oneOf(rawSettings.budgetMode, BUDGET_MODES)

  const candidate: AppState = {
    version: 1,
    settings: {
      locale: rawSettings.locale === 'es-419' || rawSettings.locale === 'en-US'
        ? rawSettings.locale
        : null,
      currency: oneOf(rawSettings.currency, CURRENCY_CODES)
        ? rawSettings.currency
        : defaults.settings.currency,
      accent: accentOk ? rawSettings.accent : 'indigo',
      themeMode: themeOk ? rawSettings.themeMode : 'auto',
      chartStyle: chartOk ? rawSettings.chartStyle : 'donut',
      // Un registro anterior a la introducción ya pertenece a alguien que usó
      // la app: no se le vuelve a mostrar el onboarding al actualizar.
      onboardingCompletedAt: hasOnboarding
        ? (rawSettings.onboardingCompletedAt as string | null)
        : '1970-01-01T00:00:00.000Z',
      budgetMode: budgetModeOk ? rawSettings.budgetMode : 'fixed',
      activeMonth: isMonthKey(rawSettings.activeMonth) ? rawSettings.activeMonth : null,
    },
    income: value.income,
    categories: value.categories,
    goals: value.goals,
    budgets: value.budgets ?? [],
  } as AppState

  const result = parseAppState(candidate)
  return result.ok ? result.value : null
}
