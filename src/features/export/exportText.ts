import type { I18nValue } from '../../app/i18n'
import { computeTotals } from '../../domain/partition'
import { computeGoal } from '../../domain/savings'
import { findMethod } from '../../domain/methods'
import { findObjective } from '../../domain/objectives'
import { nextPayday } from '../../domain/income'
import { pickText, quoteOfTheDay, tipOfTheDay } from '../../domain/tips'
import { FREQUENCY_LABEL_KEY, TERM_LABEL_KEY } from '../../i18n/keys'
import { todayISO } from '../../lib/dates'
import type { AppState, Locale } from '../../types'

const RULE = '='.repeat(78)
const THIN = '-'.repeat(78)

function localeLabel(t: I18nValue['t'], locale: Locale): string {
  return locale === 'en-US' ? t('gate.languageEn') : t('gate.languageEs')
}

/**
 * Construye el archivo .txt legible con toda la información de la app.
 * Se genera en el propio dispositivo; nada viaja por la red.
 */
export function buildExportText(state: AppState, i18n: I18nValue): string {
  const { t, locale, formatMoney, formatPercent, formatDate, formatDateTime, formatDuration, currencyName } = i18n
  const lines: string[] = []

  lines.push(RULE)
  lines.push(` ${t('common.appName')} — ${t('exportDoc.title')}`)
  lines.push(RULE)
  lines.push(`${t('exportDoc.generated')}: ${formatDateTime(new Date())}`)
  lines.push(`${t('exportDoc.language')}: ${localeLabel(t, locale)}`)
  lines.push(`${t('exportDoc.currency')}: ${state.settings.currency} — ${currencyName(state.settings.currency)}`)
  lines.push('')

  // 1. Ingreso -------------------------------------------------------------
  const totals = computeTotals(state.categories, state.income.netAmount)
  lines.push(t('exportDoc.income'))
  lines.push(THIN)
  if (state.income.netAmount > 0) {
    lines.push(`${t('exportDoc.netAmount')}: ${formatMoney(state.income.netAmount)}`)
    lines.push(`${t('exportDoc.frequency')}: ${t(FREQUENCY_LABEL_KEY[state.income.payFrequency])}`)
    lines.push(`${t('exportDoc.payday')}: ${formatDate(nextPayday(state.income))}`)
  } else {
    lines.push(t('exportDoc.empty'))
  }
  lines.push('')

  // 2. Partición -----------------------------------------------------------
  lines.push(t('exportDoc.partition'))
  lines.push(THIN)
  const assigned = [...state.categories]
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  if (assigned.length > 0) {
    assigned.forEach((category) => {
      const label = category.label || t(`presets.${category.preset}.label`)
      const share = totals.assigned > 0 ? category.amount / totals.assigned : 0
      lines.push(
        `  ${category.emoji} ${label.padEnd(26, '.')} ${formatMoney(category.amount).padStart(16)}  ${formatPercent(share).padStart(5)}`,
      )
    })
    lines.push('')
    lines.push(`  ${t('exportDoc.incomeTotal')}: ${formatMoney(totals.income)}`)
    lines.push(`  ${t('exportDoc.assigned')}: ${formatMoney(totals.assigned)} (${formatPercent(totals.ratio)})`)
    lines.push(`  ${t('exportDoc.remaining')}: ${formatMoney(totals.remaining)}`)
  } else {
    lines.push(t('exportDoc.empty'))
  }
  lines.push('')

  // 3. Metas ---------------------------------------------------------------
  lines.push(t('exportDoc.goals'))
  lines.push(THIN)
  if (state.goals.length > 0) {
    state.goals.forEach((goal, index) => {
      const math = computeGoal(goal)
      const objective = findObjective(goal.objective)
      const method = findMethod(goal.methodId)

      lines.push(`  [${index + 1}] ${goal.title} — ${objective.emoji} ${t(objective.titleKey)}`)
      lines.push(`      ${t('exportDoc.goalTarget')}: ${formatMoney(math.target)}`)
      lines.push(
        `      ${t('exportDoc.goalSaved')}: ${formatMoney(math.currentSaved)} (${formatPercent(math.progress)})`,
      )
      lines.push(`      ${t('savings.falta')}: ${formatMoney(math.remaining)}`)
      lines.push(
        `      ${t('exportDoc.goalProgress')}: ${t(TERM_LABEL_KEY[math.term])} · ${formatDuration(math.daysTotal)}`,
      )
      lines.push(`      ${t('exportDoc.goalDeadline')}: ${formatDate(math.endDate)}`)
      lines.push(`      ${t('exportDoc.goalMethod')}: ${t(method.titleKey)}`)
      lines.push(`      ${t('savings.perPeriod')}: ${formatMoney(math.requiredPerPeriod)}`)

      if (goal.contributions.length > 0) {
        lines.push(`      ${t('savings.contributions')}:`)
        const sorted = [...goal.contributions].sort((a, b) => (a.date < b.date ? -1 : 1))
        sorted.forEach((contribution) => {
          lines.push(
            `        ${formatDate(contribution.date).padEnd(18)} ${formatMoney(contribution.amount)}`,
          )
        })
      }
      lines.push('')
    })
  } else {
    lines.push(t('exportDoc.empty'))
    lines.push('')
  }

  // 4. Contenido del día ---------------------------------------------------
  const tip = tipOfTheDay()
  const quote = quoteOfTheDay()
  lines.push(t('exportDoc.tips'))
  lines.push(THIN)
  lines.push(`${t('tips.tipOfDay')}: ${pickText(tip.text, locale)}`)
  lines.push(`${t('tips.quoteOfDay')}: “${pickText(quote.text, locale)}” — ${quote.author}`)
  lines.push('')
  lines.push(RULE)
  lines.push(` ${t('exportDoc.footer')}`)
  lines.push(RULE)
  lines.push('')

  return lines.join('\n')
}

/** Genera y descarga el archivo .txt en el dispositivo. */
export function downloadExport(state: AppState, i18n: I18nValue): void {
  const content = buildExportText(state, i18n)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `finanzas-${todayISO()}.txt`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  // Se libera la URL en cuanto el navegador ya tomó el blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
