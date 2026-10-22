import { useMemo, useState } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { OBJECTIVES, findObjective } from '../../domain/objectives'
import {
  SAVINGS_METHODS,
  findMethod,
  rankMethods,
  recommendMethods,
  type SavingsMethod,
} from '../../domain/methods'
import { classifyTerm, horizonDays } from '../../domain/savings'
import { addDays, fromISO, todayISO } from '../../lib/dates'
import { createId } from '../../lib/id'
import { useNumberInput } from '../../hooks/useNumberInput'
import { cn } from '../../lib/cn'
import type { GoalHorizon, PayFrequency, SavingsGoal } from '../../types'
import { TERM_LABEL_KEY } from '../../i18n/keys'
import { Button } from '../../components/ui/Button'
import { AffixedInput, Field, Input, Select } from '../../components/ui/Field'
import { Chip } from '../../components/ui/Feedback'
import { CheckIcon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

/** Formulario controlado: la meta se compone al guardar. */
interface HorizonDraft {
  mode: 'calendar' | 'payday'
  calendar: { unit: 'days' | 'months' | 'years'; value: number }
  payday: { payFrequency: PayFrequency; payments: number; customIntervalDays: number }
}

function createDraftGoal(): SavingsGoal {
  return {
    id: createId(),
    title: '',
    objective: 'emergency',
    targetAmount: 0,
    initialAmount: 0,
    startDate: todayISO(),
    methodId: '',
    horizon: { mode: 'calendar', unit: 'months', value: 3 },
    contributions: [],
    createdAt: new Date().toISOString(),
  }
}

function toHorizonDraft(horizon: GoalHorizon, income: { payFrequency: PayFrequency; customIntervalDays: number }): HorizonDraft {
  if (horizon.mode === 'calendar') {
    return {
      mode: 'calendar',
      calendar: { unit: horizon.unit, value: horizon.value },
      payday: { payFrequency: income.payFrequency, payments: 12, customIntervalDays: income.customIntervalDays },
    }
  }
  return {
    mode: 'payday',
    calendar: { unit: 'months', value: 3 },
    payday: {
      payFrequency: horizon.payFrequency,
      payments: horizon.payments,
      customIntervalDays: horizon.customIntervalDays,
    },
  }
}

function toHorizon(draft: HorizonDraft): GoalHorizon {
  return draft.mode === 'calendar'
    ? { mode: 'calendar', unit: draft.calendar.unit, value: draft.calendar.value }
    : { mode: 'payday', ...draft.payday }
}

interface MethodOptionProps {
  method: SavingsMethod
  selected: boolean
  onSelect: () => void
}

function MethodOption({ method, selected, onSelect }: MethodOptionProps) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all',
        selected
          ? 'border-primary bg-primary-soft/60 ring-1 ring-primary'
          : 'border-border bg-surface hover:border-primary/40',
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text">{t(method.titleKey)}</span>
        {selected ? <CheckIcon className="h-4.5 w-4.5 shrink-0 text-primary-strong" /> : null}
      </span>
      <span className="mt-1 block text-sm leading-relaxed text-muted">{t(method.summaryKey)}</span>
      <span className="mt-2 block text-xs leading-relaxed text-muted">
        <span className="font-medium text-text">{t('savings.methodSource')}:</span>{' '}
        {t(method.sourceKey)}
      </span>
    </button>
  )
}

interface GoalDialogProps {
  open: boolean
  /** `null` = crear una meta nueva. */
  goal: SavingsGoal | null
  onClose: () => void
  onSave: (goal: SavingsGoal) => void
}

/** Alta y edición de metas: objetivo, monto, duración y método recomendado. */
export function GoalDialog({ open, goal, onClose, onSave }: GoalDialogProps) {
  const { t, currencySymbol, formatDuration, formatDate } = useI18n()
  const { state } = useAppState()

  const [fields, setFields] = useState<Omit<SavingsGoal, 'horizon'>>(() => goal ?? createDraftGoal())
  const [horizonDraft, setHorizonDraft] = useState<HorizonDraft>(() =>
    toHorizonDraft(goal?.horizon ?? { mode: 'calendar', unit: 'months', value: 3 }, state.income),
  )
  const [showCatalog, setShowCatalog] = useState(false)

  // Al abrir el formulario se reinicia desde la meta (o se crea un borrador).
  const formKey = open ? (goal?.id ?? 'new') : null
  const [prevFormKey, setPrevFormKey] = useState<string | null>(formKey)
  if (prevFormKey !== formKey) {
    setPrevFormKey(formKey)
    if (open) {
      const next = goal ?? createDraftGoal()
      setFields(next)
      setHorizonDraft(toHorizonDraft(next.horizon, state.income))
      setShowCatalog(false)
    }
  }

  const target = useNumberInput(fields.targetAmount, (value) =>
    setFields((previous) => ({ ...previous, targetAmount: value })),
  )
  const initial = useNumberInput(fields.initialAmount, (value) =>
    setFields((previous) => ({ ...previous, initialAmount: value })),
  )
  const duration = useNumberInput(horizonDraft.calendar.value, (value) =>
    setHorizonDraft((previous) => ({ ...previous, calendar: { ...previous.calendar, value } })),
  )
  const payments = useNumberInput(horizonDraft.payday.payments, (value) =>
    setHorizonDraft((previous) => ({ ...previous, payday: { ...previous.payday, payments: value } })),
  )
  const interval = useNumberInput(horizonDraft.payday.customIntervalDays, (value) =>
    setHorizonDraft((previous) => ({
      ...previous,
      payday: { ...previous.payday, customIntervalDays: value },
    })),
  )

  const horizon = toHorizon(horizonDraft)
  const term = useMemo(() => classifyTerm(horizonDays(horizon)), [horizon])
  const objective = findObjective(fields.objective)
  const recommendations = useMemo(
    () => recommendMethods({ term, objective: fields.objective }),
    [term, fields.objective],
  )
  const catalog = useMemo(
    () => rankMethods({ term, objective: fields.objective }),
    [term, fields.objective],
  )
  const effectiveMethodId = fields.methodId || recommendations[0]?.id || SAVINGS_METHODS[0].id
  const options = showCatalog ? catalog : recommendations
  const durationDays = horizonDays(horizon)
  const endDate = addDays(fromISO(fields.startDate), durationDays)
  const canSave = fields.targetAmount > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({
      ...fields,
      title: fields.title.trim() || t(objective.titleKey),
      methodId: effectiveMethodId,
      horizon,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={goal ? t('common.edit') : t('savings.newGoal')}
      description={t('savings.subtitle')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {goal ? t('savings.saveGoal') : t('savings.createGoal')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Field
          label={t('savings.goalTitleLabel')}
          htmlFor="goal-title"
          hint={`${objective.emoji} ${t(objective.titleKey)} · ${t('common.optional')}`}
        >
          <Input
            id="goal-title"
            value={fields.title}
            placeholder={t('savings.goalTitlePlaceholder')}
            onChange={(event) => setFields((previous) => ({ ...previous, title: event.target.value }))}
          />
        </Field>

        <Field label={t('savings.objective')}>
          <div className="flex flex-wrap gap-2">
            {OBJECTIVES.map((item) => (
              <Chip
                key={item.key}
                selected={fields.objective === item.key}
                onClick={() => setFields((previous) => ({ ...previous, objective: item.key }))}
                icon={<span>{item.emoji}</span>}
              >
                {t(item.titleKey)}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t('savings.targetAmount')}
            htmlFor="goal-target"
            hint={t('savings.targetHint')}
          >
            <AffixedInput
              id="goal-target"
              inputMode="decimal"
              prefix={currencySymbol}
              value={target.value}
              onChange={target.onChange}
              placeholder="0"
            />
          </Field>

          <Field label={t('savings.initialAmount')} htmlFor="goal-initial" hint={t('savings.initialHint')}>
            <AffixedInput
              id="goal-initial"
              inputMode="decimal"
              prefix={currencySymbol}
              value={initial.value}
              onChange={initial.onChange}
              placeholder="0"
            />
          </Field>
        </div>

        <Field label={t('savings.startDate')} htmlFor="goal-start">
          <Input
            id="goal-start"
            type="date"
            value={fields.startDate}
            onChange={(event) => setFields((previous) => ({ ...previous, startDate: event.target.value }))}
          />
        </Field>

        {/* Duración */}
        <div className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
          <Field label={t('savings.horizon')}>
            <SegmentedControl
              ariaLabel={t('savings.horizon')}
              value={horizonDraft.mode}
              onChange={(mode) => setHorizonDraft((previous) => ({ ...previous, mode }))}
              options={[
                { value: 'calendar', label: t('savings.horizonCalendar') },
                { value: 'payday', label: t('savings.horizonPayday') },
              ]}
            />
          </Field>

          <p className="text-xs leading-relaxed text-muted">
            {horizonDraft.mode === 'calendar'
              ? t('savings.horizonHintCalendar')
              : t('savings.horizonHintPayday')}
          </p>

          {horizonDraft.mode === 'calendar' ? (
            <Field label={t('savings.horizon')} htmlFor="goal-duration">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id="goal-duration"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={duration.value}
                  onChange={duration.onChange}
                  className="w-full shrink-0 sm:w-24"
                />
                <SegmentedControl
                  className="w-full min-w-0 sm:flex-1"
                  ariaLabel={t('savings.horizon')}
                  value={horizonDraft.calendar.unit}
                  onChange={(unit) =>
                    setHorizonDraft((previous) => ({ ...previous, calendar: { ...previous.calendar, unit } }))
                  }
                  options={[
                    { value: 'days', label: t('savings.unitDays') },
                    { value: 'months', label: t('savings.unitMonths') },
                    { value: 'years', label: t('savings.unitYears') },
                  ]}
                />
              </div>
            </Field>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t('partition.payFrequency')} htmlFor="goal-frequency">
                <Select
                  id="goal-frequency"
                  value={horizonDraft.payday.payFrequency}
                  onChange={(event) =>
                    setHorizonDraft((previous) => ({
                      ...previous,
                      payday: {
                        ...previous.payday,
                        payFrequency: event.target.value as PayFrequency,
                      },
                    }))
                  }
                >
                  <option value="weekly">{t('partition.frequencyWeekly')}</option>
                  <option value="biweekly">{t('partition.frequencyBiweekly')}</option>
                  <option value="monthly">{t('partition.frequencyMonthly')}</option>
                  <option value="custom">{t('partition.frequencyCustom')}</option>
                </Select>
              </Field>

              {horizonDraft.payday.payFrequency === 'custom' ? (
                <Field label={t('partition.customInterval')} htmlFor="goal-interval">
                  <Input
                    id="goal-interval"
                    type="number"
                    min={1}
                    value={interval.value}
                    onChange={interval.onChange}
                  />
                </Field>
              ) : null}

              <Field label={t('savings.payments')} htmlFor="goal-payments" hint={t('savings.paymentsHint')}>
                <Input
                  id="goal-payments"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={payments.value}
                  onChange={payments.onChange}
                />
              </Field>
            </div>
          )}

          <p className="rounded-xl bg-surface px-3 py-2 text-xs text-muted">
            {t('savings.derivedTerm', { duration: formatDuration(durationDays) })} ·{' '}
            <span className="font-medium text-text">{t('savings.deadline')}: {formatDate(endDate)}</span>
          </p>
        </div>

        {/* Métodos */}
        <div className="space-y-3">
          <Field label={t('savings.method')}>
            <p className="text-xs text-muted">{t('savings.recommendedHint')}</p>
          </Field>

          <div className="space-y-3">
            {options.map((method) => (
              <MethodOption
                key={method.id}
                method={method}
                selected={method.id === effectiveMethodId}
                onSelect={() => setFields((previous) => ({ ...previous, methodId: method.id }))}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCatalog((value) => !value)}
            aria-expanded={showCatalog}
          >
            {showCatalog ? t('savings.recommended') : `${t('savings.allMethods')} (${SAVINGS_METHODS.length})`}
          </Button>
        </div>

        {/* Vista previa del método elegido */}
        <div className="rounded-2xl border border-primary/30 bg-primary-soft/50 p-4">
          <p className="text-xs font-medium text-on-primary-soft">
            {t('savings.plan')} · {t(TERM_LABEL_KEY[term])}
          </p>
          <p className="mt-1 text-sm font-semibold text-text">
            {t(findMethod(effectiveMethodId).titleKey)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {t(findMethod(effectiveMethodId).summaryKey)}
          </p>
        </div>
      </div>
    </Modal>
  )
}
