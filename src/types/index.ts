/**
 * Modelo de datos de la aplicación.
 * Todas las entidades que viven en el almacenamiento local están aquí; si este
 * archivo cambia, hay que revisar también `src/storage/localStore.ts`.
 */

export type Locale = 'es-419' | 'en-US'

export const CURRENCY_CODES = [
  'USD',
  'MXN',
  'COP',
  'ARS',
  'CLP',
  'PEN',
  'UYU',
  'BOB',
  'DOP',
  'GTQ',
  'HNL',
  'NIO',
  'PAB',
  'CRC',
  'EUR',
  'BRL',
] as const

export type CurrencyCode = (typeof CURRENCY_CODES)[number]

/** Frecuencia con la que entra el ingreso. `custom` usa un intervalo en días. */
export type PayFrequency = 'weekly' | 'biweekly' | 'monthly' | 'custom'

/**
 * Presets de color de acento. El valor real de cada uno vive en `index.css`
 * (tokens `--color-primary*`); aquí solo están los identificadores.
 */
export const ACCENT_IDS = [
  'indigo',
  'vrock',
  'ocean',
  'emerald',
  'violet',
  'amber',
  'rose',
  'graphite',
] as const

export type AccentId = (typeof ACCENT_IDS)[number]

/** Modo de tema: sigue al sistema, o forzado a claro/oscuro. */
export type ThemeMode = 'auto' | 'light' | 'dark'

/**
 * Estilo de la gráfica principal de distribución. El usuario lo elige en
 * Ajustes y se aplica al Panel y a Partición (misma paleta, distinta forma).
 */
export const CHART_STYLES = ['donut', 'ranking', 'gauge', 'stacked'] as const

export type ChartStyle = (typeof CHART_STYLES)[number]

/**
 * Forma de presupuestar:
 * - `fixed`: un ingreso de referencia y una sola partición.
 * - `variable`: un presupuesto independiente por mes (`budgets`).
 */
export type BudgetMode = 'fixed' | 'variable'

export interface Settings {
  /** `null` = la app nunca ha preguntado idioma (pantalla de bienvenida). */
  locale: Locale | null
  currency: CurrencyCode
  accent: AccentId
  themeMode: ThemeMode
  /** Cómo se muestra la distribución del ingreso. */
  chartStyle: ChartStyle
  /** ISO de cuando se completó (o se saltó) la introducción. `null` = pendiente. */
  onboardingCompletedAt: string | null
  /** Presupuesto fijo o presupuestos mensuales independientes. */
  budgetMode: BudgetMode
  /** Mes visible en modo variable (`YYYY-MM`). */
  activeMonth: string | null
}

export interface IncomeProfile {
  /** Ingreso neto mensual, después de impuestos y descuentos. */
  netAmount: number
  payFrequency: PayFrequency
  /** Fecha (ISO) del primer o próximo cobro: es el ancla del calendario. */
  paydayDate: string
  /** Intervalo en días cuando `payFrequency` es `custom`. */
  customIntervalDays: number
}

/** Categorías predefinidas de gasto. `custom` = creada por la persona. */
export type CategoryPreset =
  | 'housing'
  | 'utilities'
  | 'cards'
  | 'food'
  | 'transport'
  | 'health'
  | 'education'
  | 'leisure'
  | 'savings'
  | 'debt'
  | 'personal'
  | 'other'
  | 'custom'

export interface ExpenseCategory {
  id: string
  preset: CategoryPreset
  /** Nombre visible: se prellena con la categoría y se puede personalizar. */
  label: string
  emoji: string
  color: string
  amount: number
}

export type ObjectiveKey =
  | 'vehicle'
  | 'phone'
  | 'tools'
  | 'investment'
  | 'home'
  | 'travel'
  | 'education'
  | 'emergency'
  | 'debt'
  | 'custom'

/** Clasificación del plazo de una meta: se usa para recomendar métodos. */
export type TermLength = 'short' | 'medium' | 'long'

/**
 * Horizonte de una meta de ahorro.
 * - `calendar`: plazo en días/meses/años desde la fecha de inicio.
 * - `payday`:   el plazo se cuenta en cobros (semanas/quincenas/meses).
 */
export type GoalHorizon =
  | { mode: 'calendar'; unit: 'days' | 'months' | 'years'; value: number }
  | {
      mode: 'payday'
      payFrequency: PayFrequency
      payments: number
      customIntervalDays: number
    }

export interface Contribution {
  id: string
  /** Fecha ISO corta: `YYYY-MM-DD`. */
  date: string
  amount: number
}

/**
 * Presupuesto de un mes concreto. Es totalmente independiente de los demás:
 * cambiar sus montos no altera meses anteriores ni posteriores.
 */
export interface BudgetMonth {
  /** Clave del mes `YYYY-MM`; solo puede existir un registro por mes. */
  id: string
  /** Ingreso neto de ese mes (puede ser 0). */
  income: number
  categories: ExpenseCategory[]
  /** Nota breve opcional (ej. “mes con bono”, “trabajo freelance”). */
  note: string
  updatedAt: string
}

export interface SavingsGoal {
  id: string
  title: string
  objective: ObjectiveKey
  targetAmount: number
  /** Monto ya disponible al crear la meta (no depende de aportes). */
  initialAmount: number
  /** `YYYY-MM-DD`: desde aquí se cuenta el plazo. */
  startDate: string
  methodId: string
  horizon: GoalHorizon
  contributions: Contribution[]
  createdAt: string
}

/**
 * Estado completo de la app. Es lo único que se guarda en `localStorage`,
 * por lo que nunca sale del dispositivo.
 */
export interface AppState {
  version: 1
  settings: Settings
  income: IncomeProfile
  categories: ExpenseCategory[]
  goals: SavingsGoal[]
  /** Presupuestos independientes por mes (modo variable). */
  budgets: BudgetMonth[]
}
