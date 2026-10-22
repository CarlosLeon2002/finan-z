import type { CategoryPreset, ExpenseCategory, IncomeProfile } from '../types'
import { createId } from '../lib/id'
import { todayISO } from '../lib/dates'

/** Paleta compartida: mismos tonos en la torta, en la lista y en los inputs. */
export const PALETTE = [
  '#6366f1', // índigo
  '#10b981', // esmeralda
  '#f59e0b', // ámbar
  '#f43f5e', // rosa
  '#0ea5e9', // cielo
  '#8b5cf6', // violeta
  '#14b8a6', // teal
  '#ec4899', // magenta
  '#84cc16', // lima
  '#fb923c', // naranja
  '#64748b', // piedra
  '#eab308', // amarillo
] as const

interface PresetMeta {
  emoji: string
  color: string
}

/** Emoji y color por defecto de cada categoría base. */
export const PRESET_META: Record<CategoryPreset, PresetMeta> = {
  housing: { emoji: '🏠', color: PALETTE[0] },
  utilities: { emoji: '💡', color: PALETTE[4] },
  cards: { emoji: '💳', color: PALETTE[3] },
  food: { emoji: '🛒', color: PALETTE[1] },
  transport: { emoji: '🚗', color: PALETTE[2] },
  health: { emoji: '🩺', color: PALETTE[7] },
  education: { emoji: '🎓', color: PALETTE[5] },
  leisure: { emoji: '🎬', color: PALETTE[6] },
  savings: { emoji: '🏦', color: PALETTE[8] },
  debt: { emoji: '🧾', color: PALETTE[9] },
  personal: { emoji: '👕', color: PALETTE[11] },
  other: { emoji: '📦', color: PALETTE[10] },
  custom: { emoji: '✨', color: PALETTE[5] },
}

/** Categorías con las que arranca la app (montos en 0, listas para editar). */
export const DEFAULT_CATEGORY_PRESETS: CategoryPreset[] = [
  'housing',
  'utilities',
  'cards',
  'food',
  'transport',
  'savings',
]

/** Crea una categoría con emoji y color del preset; el nombre se prellena al render. */
export function createCategory(
  preset: CategoryPreset,
  amount = 0,
  overrides: Partial<Pick<ExpenseCategory, 'label' | 'emoji' | 'color'>> = {},
): ExpenseCategory {
  const meta = PRESET_META[preset]
  return {
    id: createId(),
    preset,
    label: overrides.label ?? '',
    emoji: overrides.emoji ?? meta.emoji,
    color: overrides.color ?? meta.color,
    amount,
  }
}

export function createDefaultIncome(): IncomeProfile {
  return {
    netAmount: 0,
    payFrequency: 'monthly',
    paydayDate: todayISO(),
    customIntervalDays: 15,
  }
}

export interface PartitionTotals {
  income: number
  assigned: number
  remaining: number
  /** Asignado sobre el ingreso, en rango 0..1 (o 0 si no hay ingreso). */
  ratio: number
  isOverBudget: boolean
}

export function computeTotals(categories: ExpenseCategory[], income: number): PartitionTotals {
  const safeIncome = Math.max(0, income)
  const assigned = categories.reduce((sum, category) => sum + Math.max(0, category.amount), 0)
  const remaining = safeIncome - assigned

  return {
    income: safeIncome,
    assigned,
    remaining,
    ratio: safeIncome > 0 ? Math.min(1, assigned / safeIncome) : 0,
    isOverBudget: safeIncome > 0 && assigned > safeIncome,
  }
}

/** Participación de un monto dentro del total de la torta (0 si todo es 0). */
export function pieShare(amount: number, total: number): number {
  return total > 0 ? Math.max(0, amount) / total : 0
}
