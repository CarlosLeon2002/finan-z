import type { IncomeProfile, PayFrequency } from '../types'
import { addDays, fromISO } from '../lib/dates'

/** Promedio calendario: 1 mes ≈ 30.44 días. */
export const AVG_MONTH_DAYS = 30.4375

/** Duración en días de un intervalo salarial (semana, quincena, mes, personalizado). */
export function payIntervalDays(frequency: PayFrequency, customIntervalDays: number): number {
  switch (frequency) {
    case 'weekly':
      return 7
    case 'biweekly':
      return 14
    case 'monthly':
      return AVG_MONTH_DAYS
    case 'custom': {
      const days = Math.round(customIntervalDays)
      return days > 0 ? days : AVG_MONTH_DAYS
    }
  }
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/**
 * Próximo cobro a partir de la fecha ancla guardada.
 * - Mensual: se respeta el día del mes (se ajusta si el mes es más corto).
 * - Resto: se avanza intervalo a intervalo desde el ancla hasta alcanzar hoy.
 */
export function nextPayday(income: IncomeProfile, from: Date = new Date()): Date {
  const today = startOfDay(from)
  const anchor = fromISO(income.paydayDate)

  if (income.payFrequency === 'monthly') {
    const day = anchor.getDate()
    const thisMonth = new Date(from.getFullYear(), from.getMonth(), day)
    return thisMonth >= today ? thisMonth : new Date(from.getFullYear(), from.getMonth() + 1, day)
  }

  const interval = payIntervalDays(income.payFrequency, income.customIntervalDays)
  let candidate = new Date(anchor)
  let guard = 0
  while (candidate < today && guard < 4000) {
    candidate = addDays(candidate, interval)
    guard += 1
  }
  return candidate
}
