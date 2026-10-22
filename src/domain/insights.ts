import type { AppState, SavingsGoal } from '../types'
import type { TranslationKey } from '../i18n/types'
import type { BudgetView } from './budget'
import { computeGoal } from './savings'
import { computeTotals } from './partition'
import { SAVINGS_METHODS } from './methods'

/**
 * Motor de alertas y recomendaciones.
 *
 * Se recalcula en cada render a partir del presupuesto visible y de las metas
 * abiertas, así que un monto negativo aparece en el mismo instante en que se
 * edita. Las recomendaciones no son genéricas: cambian según el modo de
 * presupuesto, el objetivo de la meta, el plazo y el margen disponible.
 */

export type AlertScope = 'budget' | 'goal'
export type AlertTone = 'danger' | 'warning' | 'info'

export interface AlertFormat {
  money: (value: number) => string
  percent: (fraction: number) => string
}

export interface SmartAlert {
  id: string
  scope: AlertScope
  goalId?: string
  tone: AlertTone
  titleKey: TranslationKey
  bodyKey: TranslationKey
  vars: Record<string, string | number>
  methodIds: string[]
  action?: 'partition' | 'savings'
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)].filter((id) => SAVINGS_METHODS.some((method) => method.id === id))
}

/**
 * Elige métodos alternativos según la situación. Siempre devuelve como máximo
 * dos, para que la recomendación sea una decisión y no otro menú.
 */
function recommendFor(
  state: AppState,
  view: BudgetView,
  goal: SavingsGoal | null,
  isOverBudget: boolean,
): string[] {
  const ids: string[] = []
  const variable = state.settings.budgetMode === 'variable'

  if (variable || view.isEmpty) ids.push('payYourselfFirst', 'envelopeBudget')
  if (isOverBudget || view.income <= 0) ids.push('envelopeBudget', 'rule503020')
  if (view.income <= 0) ids.push('fixedPerPayday', 'roundUp')

  if (goal) {
    const math = computeGoal(goal)
    if (goal.objective === 'debt') ids.push('debtAvalanche', 'envelopeBudget')
    if (goal.objective === 'emergency') ids.push('emergencyFund', 'highYieldSavings')
    if (math.term === 'short') ids.push('challenge52', 'roundUp')
    if (math.term === 'long') ids.push('investPeriodic', 'cdLadder')
    if (math.isOverdue) ids.push('challenge52', 'fixedPerPayday')
  }

  ids.push('payYourselfFirst', 'fixedPerPayday')
  return uniqueIds(ids).slice(0, 2)
}

export function buildSmartAlerts(
  state: AppState,
  view: BudgetView,
  format: AlertFormat,
): SmartAlert[] {
  const alerts: SmartAlert[] = []
  const totals = computeTotals(view.categories, view.income)
  const isVariable = state.settings.budgetMode === 'variable'
  const activeGoals = state.goals
    .map((goal) => ({ goal, math: computeGoal(goal) }))
    .filter(({ math }) => math.target > 0 && math.currentSaved < math.target)

  if (isVariable && view.isEmpty) {
    alerts.push({
      id: 'month-missing',
      scope: 'budget',
      tone: 'info',
      titleKey: 'alerts.monthMissingTitle',
      bodyKey: 'alerts.monthMissingBody',
      vars: {},
      methodIds: recommendFor(state, view, null, false),
      action: 'partition',
    })
  }

  if (totals.income <= 0 && totals.assigned > 0) {
    alerts.push({
      id: 'budget-no-income',
      scope: 'budget',
      tone: 'danger',
      titleKey: 'alerts.noIncomeTitle',
      bodyKey: 'alerts.noIncomeBody',
      vars: { amount: format.money(totals.assigned) },
      methodIds: recommendFor(state, view, null, true),
      action: 'partition',
    })
  } else if (totals.isOverBudget) {
    alerts.push({
      id: 'budget-over',
      scope: 'budget',
      tone: 'danger',
      titleKey: 'alerts.overBudgetTitle',
      bodyKey: 'alerts.overBudgetBody',
      vars: {
        amount: format.money(totals.assigned - totals.income),
        remaining: format.money(totals.remaining),
        percent: format.percent(totals.ratio),
      },
      methodIds: recommendFor(state, view, null, true),
      action: 'partition',
    })
  } else if (totals.income > 0 && totals.ratio >= 0.9) {
    alerts.push({
      id: 'budget-tight',
      scope: 'budget',
      tone: 'warning',
      titleKey: 'alerts.tightTitle',
      bodyKey: 'alerts.tightBody',
      vars: { amount: format.money(totals.remaining) },
      methodIds: recommendFor(state, view, null, false),
      action: 'partition',
    })
  }

  const budgetRemaining = Math.max(0, totals.remaining)
  const totalMonthly = activeGoals.reduce(
    (sum, { math }) => sum + Math.max(0, math.monthlyEquivalent),
    0,
  )

  if (activeGoals.length > 0 && totals.income <= 0) {
    alerts.push({
      id: 'goals-no-income',
      scope: 'goal',
      tone: 'warning',
      titleKey: 'alerts.goalsNoIncomeTitle',
      bodyKey: 'alerts.goalsNoIncomeBody',
      vars: { required: format.money(totalMonthly) },
      methodIds: recommendFor(state, view, activeGoals[0].goal, false),
      action: 'savings',
    })
  } else if (activeGoals.length > 0 && totalMonthly > budgetRemaining + 0.5) {
    const single = activeGoals.length === 1 ? activeGoals[0] : null
    alerts.push({
      id: single ? `goal-tight-${single.goal.id}` : 'goals-overcommit',
      scope: 'goal',
      ...(single ? { goalId: single.goal.id } : {}),
      tone: 'warning',
      titleKey: single ? 'alerts.goalTightTitle' : 'alerts.goalsOvercommitTitle',
      bodyKey: single ? 'alerts.goalTightBody' : 'alerts.goalsOvercommitBody',
      vars: {
        ...(single ? { title: single.goal.title } : {}),
        required: format.money(totalMonthly),
        available: format.money(budgetRemaining),
      },
      methodIds: recommendFor(state, view, single?.goal ?? activeGoals[0].goal, false),
      action: 'savings',
    })
  }

  if (totals.income > 0 && totalMonthly > totals.income * 0.6) {
    const worst = [...activeGoals].sort(
      (a, b) => b.math.monthlyEquivalent - a.math.monthlyEquivalent,
    )[0]
    if (worst) {
      alerts.push({
        id: `goal-unrealistic-${worst.goal.id}`,
        scope: 'goal',
        goalId: worst.goal.id,
        tone: 'danger',
        titleKey: 'alerts.unrealisticTitle',
        bodyKey: 'alerts.unrealisticBody',
        vars: {
          title: worst.goal.title,
          required: format.money(worst.math.monthlyEquivalent),
          percent: format.percent(worst.math.monthlyEquivalent / totals.income),
        },
        methodIds: recommendFor(state, view, worst.goal, false),
        action: 'savings',
      })
    }
  }

  for (const { goal, math } of activeGoals) {
    if (!math.isOverdue) continue
    alerts.push({
      id: `goal-overdue-${goal.id}`,
      scope: 'goal',
      goalId: goal.id,
      tone: 'danger',
      titleKey: 'alerts.goalOverdueTitle',
      bodyKey: 'alerts.goalOverdueBody',
      vars: { title: goal.title, remaining: format.money(math.remaining) },
      methodIds: recommendFor(state, view, goal, false),
      action: 'savings',
    })
  }

  return alerts
}

/** Alertas de una meta concreta (para el detalle), sin repetir las globales. */
export function goalAlerts(
  state: AppState,
  view: BudgetView,
  format: AlertFormat,
  goalId: string,
): SmartAlert[] {
  return buildSmartAlerts(state, view, format).filter(
    (alert) => alert.scope === 'goal' && (!alert.goalId || alert.goalId === goalId),
  )
}
