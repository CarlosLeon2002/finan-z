import { useMemo, useState } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { SavingsProjection } from '../../charts/SavingsProjection'
import { ContributionBars } from '../../charts/ContributionBars'
import { ProgressRing } from '../../charts/ProgressRing'
import { resolveBudget } from '../../domain/budget'
import { goalAlerts } from '../../domain/insights'
import { findMethod } from '../../domain/methods'
import { findObjective } from '../../domain/objectives'
import { buildProjection, computeGoal } from '../../domain/savings'
import { parseAmount } from '../../hooks/useNumberInput'
import { todayISO } from '../../lib/dates'
import { TERM_LABEL_KEY } from '../../i18n/keys'
import type { SavingsGoal } from '../../types'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { AffixedInput, Field, Input } from '../../components/ui/Field'
import { Badge, ProgressBar } from '../../components/ui/Feedback'
import { CheckIcon, PlusIcon, TrashIcon } from '../../components/ui/Icon'
import { SmartAlerts } from '../../components/finance/SmartAlerts'
import { Modal } from '../../components/ui/Modal'
import { describePerPeriod } from './periodText'
import { GoalCompletedDialog } from './GoalCompletedDialog'

interface StatProps {
  label: string
  value: string
  hint?: string
}

function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="figure mt-1 text-sm font-semibold text-text">{value}</p>
      {hint ? <p className="mt-0.5 truncate text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

interface ContributionFormProps {
  onAdd: (input: { date: string; amount: number }) => void
  /** Aporte sugerido para el periodo actual. */
  suggested: number
  /** Lo que falta para completar la meta. */
  remaining: number
}

function ContributionForm({ onAdd, suggested, remaining }: ContributionFormProps) {
  const { t, currencySymbol, formatMoney } = useI18n()
  const [amountText, setAmountText] = useState('')
  const [date, setDate] = useState(todayISO())
  const amount = parseAmount(amountText)

  const handleAdd = () => {
    if (amount <= 0) return
    onAdd({ date, amount })
    setAmountText('')
  }

  const fill = (value: number) => {
    if (value <= 0) return
    setAmountText(String(Math.round(value)))
  }

  return (
    <div className="rounded-2xl border border-dashed border-border p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label={t('savings.contributionAmount')} htmlFor="contribution-amount" className="flex-1">
          <AffixedInput
            id="contribution-amount"
            inputMode="decimal"
            prefix={currencySymbol}
            value={amountText}
            onChange={(event) => setAmountText(event.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label={t('savings.contributionDate')} htmlFor="contribution-date" className="sm:w-44">
          <Input
            id="contribution-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>

        <Button
          onClick={handleAdd}
          disabled={amount <= 0}
          icon={<PlusIcon className="h-4 w-4" />}
          className="sm:mb-0.5"
        >
          {t('savings.addContribution')}
        </Button>
      </div>

      {suggested > 0 || remaining > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {suggested > 0 ? (
            <button
              type="button"
              onClick={() => fill(suggested)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-primary-strong"
            >
              {t('savings.quickSuggested')}
              <span className="figure font-semibold">{formatMoney(suggested, 0)}</span>
            </button>
          ) : null}
          {remaining > 0 ? (
            <button
              type="button"
              onClick={() => fill(remaining)}
              className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-3 py-1.5 text-xs font-medium text-on-success-soft transition hover:border-success/60"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              {t('savings.completeGoal')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

interface GoalDetailDialogProps {
  open: boolean
  goal: SavingsGoal | null
  onClose: () => void
  onRemove: (id: string) => void
}

/** Detalle de una meta: gráfica de proyección, plan y registro de aportes. */
export function GoalDetailDialog({ open, goal, onClose, onRemove }: GoalDetailDialogProps) {
  const { t, formatMoney, formatPercent, formatDate, formatNumber } = useI18n()
  const { state, addContribution, removeContribution } = useAppState()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  // Al abrir el detalle (o cambiar de meta) se descarta la confirmación de borrador.
  const detailKey = open ? (goal?.id ?? null) : null
  const [prevDetailKey, setPrevDetailKey] = useState<string | null>(detailKey)
  if (prevDetailKey !== detailKey) {
    setPrevDetailKey(detailKey)
    setConfirmingDelete(false)
    setCelebrating(false)
  }

  const math = useMemo(() => (goal ? computeGoal(goal) : null), [goal])
  const points = useMemo(() => (goal ? buildProjection(goal) : []), [goal])
  const labels = useMemo(() => points.map((point) => formatDate(point.date)), [points, formatDate])

  if (!goal || !math || !open) return null

  const method = findMethod(goal.methodId)
  const objective = findObjective(goal.objective)
  const i18n = { t, formatMoney }
  const isComplete = math.target > 0 && math.currentSaved >= math.target
  const alerts = goalAlerts(
    state,
    resolveBudget(state),
    { money: formatMoney, percent: formatPercent },
    goal.id,
  )

  const handleAdd = (input: { date: string; amount: number }) => {
    const wasComplete = math.target > 0 && math.currentSaved >= math.target
    addContribution(goal.id, input)
    // Se cruza el 100 % con este aporte: se celebra una sola vez.
    if (!wasComplete && math.target > 0 && math.currentSaved + input.amount >= math.target) {
      setCelebrating(true)
    }
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="lg"
        title={goal.title}
        description={`${objective.emoji} ${t(objective.titleKey)} · ${t(TERM_LABEL_KEY[math.term])}`}
        footer={
          <div className="flex items-center justify-between gap-3">
            {confirmingDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">{t('savings.deleteGoalConfirm')}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onRemove(goal.id)
                    onClose()
                  }}
                >
                  {t('common.confirm')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                icon={<TrashIcon className="h-4 w-4" />}
                onClick={() => setConfirmingDelete(true)}
              >
                {t('savings.deleteGoal')}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        }
      >
      <div className="space-y-5">
        {/* Progreso */}
        <div className="flex items-center gap-4">
          <ProgressRing
            value={math.progress}
            size={86}
            strokeWidth={9}
            className={
              isComplete || math.isOnTrack
                ? 'text-success'
                : math.isOverdue
                  ? 'text-danger'
                  : 'text-warning'
            }
          >
            <span className="figure text-[15px] font-semibold leading-none">
              {formatPercent(math.progress)}
            </span>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{t('savings.progress')}</p>
            <p className="figure mt-0.5 text-xl font-semibold tracking-tight text-text sm:text-2xl">
              <AnimatedNumber value={math.currentSaved} format={formatMoney} />
              <span className="ml-1.5 text-sm font-medium text-muted">
                / {formatMoney(math.target)}
              </span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar
                value={math.progress}
                tone={
                  isComplete || math.isOnTrack
                    ? 'success'
                    : math.isOverdue
                      ? 'danger'
                      : 'warning'
                }
                className="flex-1"
                label={goal.title}
              />
              <Badge
                tone={
                  isComplete
                    ? 'success'
                    : math.isOverdue
                      ? 'danger'
                      : math.isOnTrack
                        ? 'success'
                        : 'warning'
                }
              >
                {isComplete
                  ? t('savings.completedBadge')
                  : math.isOverdue
                    ? t('savings.overdue')
                    : math.isOnTrack
                      ? t('savings.onTrack')
                      : t('savings.behind')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Números clave */}
        {isComplete ? (
          <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success-soft p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success text-on-success shadow-md shadow-success/25">
              <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-success-soft">
                {t('savings.completedBadge')}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-on-success-soft/85">
                {t('savings.completedHint')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={t('savings.saved')} value={formatMoney(math.currentSaved)} />
            <Stat label={t('savings.falta')} value={formatMoney(math.remaining)} />
            <Stat
              label={t('savings.perPeriod')}
              value={formatMoney(math.requiredPerPeriod)}
              hint={describePerPeriod(i18n, math)}
            />
            <Stat
              label={t('savings.deadline')}
              value={formatDate(math.endDate)}
              hint={
                math.isOverdue
                  ? t('savings.overdue')
                  : math.daysLeft === 1
                    ? t('savings.daysLeftOne')
                    : t('savings.daysLeft', { days: math.daysLeft })
              }
            />
          </div>
        )}

        {!isComplete && alerts.length > 0 ? (
          <SmartAlerts alerts={alerts} scope="goal" limit={1} />
        ) : null}

        {/* Proyección */}
        <div className="rounded-2xl border border-border p-4">
          <p className="text-sm font-semibold text-text">{t('savings.projection')}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{t('savings.projectionHint')}</p>
          <div className="mt-3 h-56 sm:h-72">
            <SavingsProjection
              points={points}
              labels={labels}
              target={math.target}
              projectionLabel={t('savings.saved')}
              targetLabel={t('savings.targetLine')}
              formatAmount={(value) => formatMoney(value, 0)}
              formatAxis={(value) => formatMoney(value, 0)}
            />
          </div>
        </div>

        {/* Método */}
        <div className="rounded-2xl border border-primary/30 bg-primary-soft/50 p-4">
          <p className="text-xs font-medium text-on-primary-soft">{t('savings.goalMethod')}</p>
          <p className="mt-1 text-sm font-semibold text-text">{t(method.titleKey)}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            <span className="font-medium text-text">{t('savings.methodSource')}:</span>{' '}
            {t(method.sourceKey)}
          </p>
        </div>

        {/* Aportes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text">{t('savings.contributions')}</h4>
            <Badge tone="neutral">{formatNumber(goal.contributions.length)}</Badge>
          </div>

          {goal.contributions.length === 0 ? (
            <p className="text-sm text-muted">{t('savings.noContributions')}</p>
          ) : (
            <>
              <div className="h-40 rounded-2xl border border-border p-3">
                <ContributionBars
                  contributions={goal.contributions}
                  emptyLabel={t('savings.monthEmpty')}
                  ariaSummary={goal.contributions
                    .map((c) => `${formatDate(c.date)} ${formatMoney(c.amount)}`)
                    .join(', ')}
                  formatAmount={(value) => formatMoney(value, 0)}
                  formatDate={formatDate}
                />
              </div>
              <ul className="divide-y divide-border rounded-2xl border border-border">
                {[...goal.contributions]
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((contribution) => (
                    <li
                      key={contribution.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <span className="text-muted">{formatDate(contribution.date)}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-text">
                          {formatMoney(contribution.amount)}
                        </span>
                        <button
                          type="button"
                          aria-label={t('common.remove')}
                          onClick={() => removeContribution(goal.id, contribution.id)}
                          className="rounded-lg p-1.5 text-muted transition hover:bg-danger-soft hover:text-on-danger-soft"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            </>
          )}

          <ContributionForm
            suggested={math.requiredPerPeriod}
            remaining={math.remaining}
            onAdd={handleAdd}
          />
        </div>
      </div>
    </Modal>

    <GoalCompletedDialog
      open={celebrating}
      title={goal.title}
      target={math.target}
      saved={math.currentSaved}
      onClose={() => setCelebrating(false)}
    />
    </>
  )
}
