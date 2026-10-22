import { useState } from 'react'
import { useI18n } from '../../app/i18n'
import { useRoute } from '../../app/router'
import { useAppState } from '../../app/state'
import { IncomeChart, type DoughnutSlice } from '../../charts/IncomeChart'
import { Sparkline } from '../../charts/Sparkline'
import { monthLabel, resolveBudget } from '../../domain/budget'
import { buildSmartAlerts } from '../../domain/insights'
import { computeGoal } from '../../domain/savings'
import { computeTotals } from '../../domain/partition'
import { findObjective } from '../../domain/objectives'
import { pickText, quoteOfTheDay, tipOfTheDay } from '../../domain/tips'
import type { TranslationKey } from '../../i18n/types'
import { cn } from '../../lib/cn'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeader } from '../../components/ui/Card'
import { Badge, EmptyState, ProgressBar } from '../../components/ui/Feedback'
import { SparklesIcon, TrendingUpIcon } from '../../components/ui/Icon'
import { SmartAlerts } from '../../components/finance/SmartAlerts'

function isFirstDay(completedAt: string | null, now: number): boolean {
  return completedAt ? now - new Date(completedAt).getTime() < 86_400_000 : false
}

/** Saludo acorde al momento del día; nunca “de nuevo” en la primera visita. */
function greetingKey(completedAt: string | null, now: number): TranslationKey {
  if (isFirstDay(completedAt, now)) return 'dashboard.greetingFirst'

  const hour = new Date(now).getHours()
  if (hour < 12) return 'dashboard.greetingMorning'
  if (hour < 19) return 'dashboard.greetingAfternoon'
  return 'dashboard.greetingEvening'
}

interface StatCardProps {
  label: string
  value: number
  format: (value: number) => string
  hint?: string
  tone?: string
  /** Serie de tendencia opcional (sparkline SVG ligero). */
  spark?: number[]
}

function StatCard({ label, value, format, hint, tone, spark }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1.5">
        <AnimatedNumber
          value={value}
          format={format}
          className={cn('figure text-2xl font-semibold tracking-tight', tone ?? 'text-text')}
        />
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {spark && spark.length > 1 ? (
        <div className="mt-2 text-primary">
          <Sparkline values={spark} />
        </div>
      ) : null}
    </Card>
  )
}

/** Resumen del día: ingreso, partición, metas y los contenidos diarios. */
export function DashboardPage() {
  const { state } = useAppState()
  const { t, locale, formatMoney, formatPercent } = useI18n()
  const { navigate } = useRoute()
  // Se congela al montar la pantalla: el saludo es estable durante la visita.
  const [now] = useState(() => Date.now())

  const view = resolveBudget(state)
  const totals = computeTotals(view.categories, view.income)
  const alerts = buildSmartAlerts(state, view, { money: formatMoney, percent: formatPercent })
  const tip = tipOfTheDay()
  const quote = quoteOfTheDay()

  const slices: DoughnutSlice[] = view.categories
    .filter((category) => category.amount > 0)
    .map((category) => ({
      id: category.id,
      label: category.label || t(`presets.${category.preset}.label`),
      amount: category.amount,
      color: category.color,
    }))

  const topExpense = [...view.categories].sort((a, b) => b.amount - a.amount)[0]
  const hasTopExpense = topExpense && topExpense.amount > 0

  const goalRows = state.goals
    .map((goal) => ({ goal, math: computeGoal(goal) }))
    .sort((a, b) => b.math.progress - a.math.progress)

  const needsIncome = view.isVariable
    ? view.isEmpty
    : view.income <= 0 && totals.assigned === 0
  const visibleAlerts = needsIncome
    ? alerts.filter((alert) => alert.scope === 'goal')
    : alerts

  return (
    <div className="animate-fade-up space-y-4">
      {/* Encabezado con degradado del acento activo */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-strong p-6 text-white shadow-lg shadow-primary/25 md:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #fff, transparent 70%)' }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t(greetingKey(state.settings.onboardingCompletedAt, now))}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {t(
                isFirstDay(state.settings.onboardingCompletedAt, now)
                  ? 'dashboard.subtitleFirst'
                  : 'dashboard.subtitle',
              )}
            </p>
            {view.isVariable && view.monthKey ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                <SparklesIcon className="h-3.5 w-3.5" />
                {t('dashboard.monthBudget', { month: monthLabel(view.monthKey, locale) })}
              </p>
            ) : null}
          </div>
          <TrendingUpIcon className="hidden h-10 w-10 text-white/70 md:block" />
        </div>
      </section>

      {needsIncome ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-text">
              {view.isVariable
                ? t('dashboard.monthEmptyTitle', {
                    month: monthLabel(view.monthKey ?? '', locale),
                  })
                : t('dashboard.noIncome')}
            </p>
            {view.isVariable ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {t('dashboard.monthEmptyText')}
              </p>
            ) : null}
          </div>
          <Button onClick={() => navigate('partition')}>
            {view.isVariable
              ? t('dashboard.createMonthBudget')
              : t('dashboard.fillIncome')}
          </Button>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t('dashboard.incomeTitle')}
            value={view.income}
            format={formatMoney}
          />
          <StatCard
            label={t('dashboard.assignedTitle')}
            value={totals.assigned}
            format={formatMoney}
            hint={formatPercent(totals.ratio)}
            tone="text-primary-strong"
          />
          <StatCard
            label={t('dashboard.availableTitle')}
            value={totals.remaining}
            format={formatMoney}
            hint={
              totals.isOverBudget
                ? t('partition.overBudgetShort')
                : hasTopExpense
                  ? `${t('dashboard.topExpense')}: ${topExpense.emoji} ${topExpense.label || t(`presets.${topExpense.preset}.label`)}`
                  : t('dashboard.nothingAssigned')
            }
            tone={totals.remaining >= 0 ? 'text-success' : 'text-danger'}
          />
        </section>
      )}

      {visibleAlerts.length > 0 ? (
        <section aria-labelledby="dashboard-alerts">
          <h2
            id="dashboard-alerts"
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            {t('dashboard.alertsTitle')}
          </h2>
          <SmartAlerts alerts={visibleAlerts} onNavigate={navigate} />
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <SectionHeader
            title={t('partition.title')}
            description={t('partition.subtitle')}
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate('partition')}>
                {t('nav.partition')}
              </Button>
            }
          />
          <div className="h-56 sm:h-64 md:h-72">
            <IncomeChart
              style={state.settings.chartStyle}
              slices={slices}
              income={totals.income}
              assigned={totals.assigned}
              available={totals.remaining}
              centerValue={formatPercent(totals.ratio)}
              labels={{
                emptyLabel: t('partition.chartEmpty'),
                centerLabel: t('partition.chartCenter'),
                gaugeOf: t('partition.gaugeOf'),
                availableLabel: t('partition.stackedAvailable'),
              }}
              ariaSummary={slices
                .map((slice) => `${slice.label} ${formatMoney(slice.amount)}`)
                .join(', ')}
              formatAmount={formatMoney}
              formatPercent={formatPercent}
              selectedId={null}
            />
          </div>
          {hasTopExpense ? (
            <p className="mt-3 text-sm text-muted">
              {t('dashboard.topExpense')}:{' '}
              <span className="font-medium text-text">
                {topExpense.emoji} {topExpense.label || t(`presets.${topExpense.preset}.label`)}
              </span>{' '}
              · {formatMoney(topExpense.amount)}
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <SectionHeader
            title={t('dashboard.goalsTitle')}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('savings')}>
                {t('dashboard.seeSavings')}
              </Button>
            }
          />

          {goalRows.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title={t('savings.emptyTitle')}
              description={t('dashboard.goalsEmpty')}
              action={
                <Button size="sm" onClick={() => navigate('savings')}>
                  {t('dashboard.createGoal')}
                </Button>
              }
            />
          ) : (
            <ul className="space-y-4">
              {goalRows.slice(0, 3).map(({ goal, math }) => (
                <li key={goal.id}>
                  <button
                    type="button"
                    onClick={() => navigate('savings')}
                    className="w-full rounded-xl p-1 text-left transition hover:bg-surface-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-text">
                        {findObjective(goal.objective).emoji} {goal.title}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-muted">
                        {formatPercent(math.progress)}
                      </span>
                    </div>
                    <ProgressBar
                      value={math.progress}
                      tone={math.isOverdue ? 'danger' : math.isOnTrack ? 'success' : 'warning'}
                      className="mt-2"
                      label={goal.title}
                    />
                    <p className="mt-1.5 text-xs text-muted">
                      {formatMoney(math.currentSaved)} / {formatMoney(math.target)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <Badge tone="primary">{t('dashboard.tipTitle')}</Badge>
          <p className="mt-3 text-sm leading-relaxed text-text">{pickText(tip.text, locale)}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 -ml-3.5"
            onClick={() => navigate('tips')}
          >
            {t('dashboard.seeAllTips')}
          </Button>
        </Card>

        <Card className="relative overflow-hidden p-5">
          <Badge tone="warning">{t('dashboard.quoteTitle')}</Badge>
          <p className="mt-3 text-sm italic leading-relaxed text-text">
            “{pickText(quote.text, locale)}”
          </p>
          <p className="mt-2 text-sm font-semibold text-muted">— {quote.author}</p>
        </Card>
      </section>
    </div>
  )
}
