import type { GoalHorizon, SavingsGoal, TermLength } from '../types'
import { addDays, daysBetween, fromISO } from '../lib/dates'
import { AVG_MONTH_DAYS, payIntervalDays } from './income'

const AVG_YEAR_DAYS = 365.25

/** Duración total de una meta en días naturales. */
export function horizonDays(horizon: GoalHorizon): number {
  if (horizon.mode === 'calendar') {
    switch (horizon.unit) {
      case 'days':
        return Math.max(0, Math.round(horizon.value))
      case 'months':
        return Math.round(Math.max(0, horizon.value) * AVG_MONTH_DAYS)
      case 'years':
        return Math.round(Math.max(0, horizon.value) * AVG_YEAR_DAYS)
    }
  }

  const interval = payIntervalDays(horizon.payFrequency, horizon.customIntervalDays)
  return Math.round(Math.max(1, horizon.payments) * interval)
}

/** Clasificación usada para recomendar métodos de ahorro. */
export function classifyTerm(days: number): TermLength {
  if (days <= 90) return 'short'
  if (days <= 730) return 'medium'
  return 'long'
}

/** Cadencia de aporte sugerida: semanal para plazos muy cortos, mensual si no. */
export type GoalCadence = 'weekly' | 'monthly'

export function cadenceOf(horizon: GoalHorizon): GoalCadence {
  if (horizon.mode === 'calendar' && horizon.unit === 'days' && horizon.value <= 60) {
    return 'weekly'
  }
  return 'monthly'
}

function countPeriods(horizon: GoalHorizon, days: number, cadence: GoalCadence): number {
  if (horizon.mode === 'payday') return Math.max(1, Math.round(horizon.payments))
  const periodDays = cadence === 'weekly' ? 7 : AVG_MONTH_DAYS
  return Math.max(1, Math.ceil(days / periodDays))
}

export interface GoalMath {
  target: number
  initial: number
  currentSaved: number
  remaining: number
  /** Avance real sobre la meta (0..1). */
  progress: number
  startDate: Date
  endDate: Date
  daysTotal: number
  elapsedDays: number
  daysLeft: number
  cadence: GoalCadence
  /** `true` si la duración se define en cobros salariales (no en fechas). */
  isPaydayBased: boolean
  periodsTotal: number
  periodsElapsed: number
  periodsLeft: number
  /** Cuánto deberías aportar en cada periodo para llegar a tiempo. */
  requiredPerPeriod: number
  /** Equivalente mensual necesario con el tiempo que queda. */
  monthlyEquivalent: number
  /** Avance esperado según el calendario (0..1). */
  expectedProgress: number
  isOnTrack: boolean
  isOverdue: boolean
  term: TermLength
}

/**
 * Toda la matemática de una meta en un solo lugar: progreso, fechas y montos
 * sugeridos. Es la función que alimenta las tarjetas, el detalle y el gráfico.
 */
export function computeGoal(goal: SavingsGoal, now: Date = new Date()): GoalMath {
  const startDate = fromISO(goal.startDate)
  const daysTotal = horizonDays(goal.horizon)
  const endDate = addDays(startDate, daysTotal)

  const elapsedDays = Math.min(daysTotal, Math.max(0, daysBetween(startDate, now)))
  const rawDaysLeft = daysBetween(now, endDate)
  const daysLeft = Math.max(0, rawDaysLeft)

  const initial = Math.max(0, goal.initialAmount)
  const target = Math.max(0, goal.targetAmount)
  const currentSaved =
    initial + goal.contributions.reduce((sum, contribution) => sum + Math.max(0, contribution.amount), 0)
  const remaining = Math.max(0, target - currentSaved)

  const progress = target > 0 ? Math.min(1, currentSaved / target) : 0
  const cadence = cadenceOf(goal.horizon)
  const periodsTotal = countPeriods(goal.horizon, daysTotal, cadence)
  // En metas por cobro el periodo real es el intervalo salarial, no el mes.
  const periodDays =
    goal.horizon.mode === 'payday'
      ? payIntervalDays(goal.horizon.payFrequency, goal.horizon.customIntervalDays)
      : cadence === 'weekly'
        ? 7
        : AVG_MONTH_DAYS
  const periodsElapsed = Math.min(periodsTotal, Math.floor(elapsedDays / periodDays))
  const periodsLeft = Math.max(1, periodsTotal - periodsElapsed)

  const requiredPerPeriod = remaining / periodsLeft
  const monthlyEquivalent = daysLeft > 0 ? remaining / (daysLeft / AVG_MONTH_DAYS) : remaining

  const expectedProgress = daysTotal > 0 ? Math.min(1, elapsedDays / daysTotal) : 1
  const isOnTrack = currentSaved >= target * expectedProgress - 0.005
  const isOverdue = rawDaysLeft < 0 && remaining > 0

  return {
    target,
    initial,
    currentSaved,
    remaining,
    progress,
    startDate,
    endDate,
    daysTotal,
    elapsedDays,
    daysLeft,
    cadence,
    isPaydayBased: goal.horizon.mode === 'payday',
    periodsTotal,
    periodsElapsed,
    periodsLeft,
    requiredPerPeriod,
    monthlyEquivalent,
    expectedProgress,
    isOnTrack,
    isOverdue,
    term: classifyTerm(daysTotal),
  }
}

export interface ProjectionPoint {
  date: Date
  amount: number
  /** Datos ya ocurridos (aportes reales) vs. lo que proyectas. */
  isPast: boolean
}

/**
 * Serie de la proyección: histórico real + tramo futuro al ritmo necesario
 * para llegar a la meta en la fecha límite.
 */
export function buildProjection(goal: SavingsGoal, now: Date = new Date()): ProjectionPoint[] {
  const math = computeGoal(goal, now)
  const stepDays = math.cadence === 'weekly' ? 7 : AVG_MONTH_DAYS
  const maxPoints = 60

  const actualAt = (date: Date) =>
    goal.initialAmount +
    goal.contributions.reduce((sum, contribution) => {
      const contributionDate = fromISO(contribution.date)
      return contributionDate <= date ? sum + Math.max(0, contribution.amount) : sum
    }, 0)

  const amountAt = (date: Date): number => {
    if (date <= now) return actualAt(date)
    if (math.daysLeft <= 0) return math.currentSaved
    const fraction = Math.min(1, daysBetween(now, date) / math.daysLeft)
    return math.currentSaved + math.remaining * fraction
  }

  // Si el plazo es largo, alargamos el paso para no pasarnos de `maxPoints`.
  const span = Math.max(1, math.daysTotal)
  const effectiveStep = Math.max(stepDays, span / maxPoints)

  const points: ProjectionPoint[] = []
  let cursor = new Date(math.startDate)
  let guard = 0

  while (cursor <= math.endDate && guard < maxPoints + 1) {
    points.push({ date: new Date(cursor), amount: amountAt(cursor), isPast: cursor <= now })
    cursor = addDays(cursor, effectiveStep)
    guard += 1
  }

  const last = points.at(-1)
  if (!last || last.date.getTime() !== math.endDate.getTime()) {
    points.push({ date: math.endDate, amount: amountAt(math.endDate), isPast: math.endDate <= now })
  }

  return points
}
