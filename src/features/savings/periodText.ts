import type { I18nValue } from '../../app/i18n'
import type { GoalMath } from '../../domain/savings'

type I18nPick = Pick<I18nValue, 't' | 'formatMoney'>

/**
 * Texto del aporte sugerido según cómo se definió la meta:
 * por cobro salarial, semanal o mensual.
 */
export function describePerPeriod(i18n: I18nPick, math: GoalMath): string {
  const amount = i18n.formatMoney(math.requiredPerPeriod)
  if (math.isPaydayBased) return i18n.t('savings.perPeriodPayroll', { amount })
  if (math.cadence === 'weekly') return i18n.t('savings.perPeriodWeek', { amount })
  return i18n.t('savings.perPeriodMonth', { amount })
}
