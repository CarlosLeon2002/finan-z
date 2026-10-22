import { useState } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { IncomeChart, type DoughnutSlice } from '../../charts/IncomeChart'
import {
  createMonthBudget,
  currentMonthKey,
  monthLabel,
  resolveBudget,
  shiftMonth,
} from '../../domain/budget'
import { nextPayday } from '../../domain/income'
import { buildSmartAlerts } from '../../domain/insights'
import { computeTotals } from '../../domain/partition'
import { useNumberInput } from '../../hooks/useNumberInput'
import { cn } from '../../lib/cn'
import type { BudgetMode, ExpenseCategory, PayFrequency } from '../../types'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeader } from '../../components/ui/Card'
import { AffixedInput, Field, Input, Select } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
} from '../../components/ui/Icon'
import { SmartAlerts } from '../../components/finance/SmartAlerts'
import { CategoryDialog } from './CategoryDialog'

interface CategoryRowProps {
  category: ExpenseCategory
  /** Participación dentro del total asignado (0..1). */
  share: number
  onEdit: () => void
  onRemove: () => void
  onAmount: (value: number) => void
}

function CategoryRow({ category, share, onEdit, onRemove, onAmount }: CategoryRowProps) {
  const { t, formatPercent, currencySymbol } = useI18n()
  const amount = useNumberInput(category.amount, onAmount)

  const label = category.label || t(`presets.${category.preset}.label`)

  return (
    <li
      className={cn(
        'rounded-2xl border bg-surface p-3 transition-colors',
        category.amount > 0 ? 'border-border' : 'border-dashed border-border',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
          style={{ backgroundColor: `${category.color}26` }}
        >
          {category.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{label}</p>
          <p className="truncate text-xs text-muted">{t(`presets.${category.preset}.hint`)}</p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          aria-label={t('partition.editCategory')}
          className="rounded-xl p-2 text-muted transition hover:bg-surface-2 hover:text-text"
        >
          <PencilIcon className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('partition.removeCategory')}
          className="rounded-xl p-2 text-muted transition hover:bg-danger-soft hover:text-on-danger-soft"
        >
          <TrashIcon className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <AffixedInput
          inputMode="decimal"
          prefix={currencySymbol}
          value={amount.value}
          onChange={amount.onChange}
          placeholder="0"
          aria-label={`${label} · ${t('common.amount')}`}
          className="h-10"
        />
        <span className="w-16 shrink-0 text-right text-sm font-medium text-muted">
          {formatPercent(share)}
        </span>
      </div>
    </li>
  )
}

/**
 * Partición del ingreso.
 * En modo fijo usa el perfil de ingreso único; en modo variable cada mes tiene
 * su propio ingreso y sus categorías, sin heredar montos de otros meses.
 */
export function PartitionPage() {
  const {
    state,
    setIncome,
    upsertCategory,
    removeCategory,
    setBudgetMode,
    setActiveMonth,
    saveBudgetMonth,
    removeBudgetMonth,
    upsertBudgetCategory,
    removeBudgetCategory,
  } = useAppState()
  const { t, locale, formatMoney, formatPercent, currencySymbol, formatDate } = useI18n()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [removeMonthOpen, setRemoveMonthOpen] = useState(false)

  const view = resolveBudget(state)
  const totals = computeTotals(view.categories, view.income)
  const editing = view.categories.find((category) => category.id === editingId) ?? null
  const needsMonth = view.isVariable && !view.month

  const alerts = buildSmartAlerts(state, view, {
    money: formatMoney,
    percent: formatPercent,
  }).filter((alert) => alert.scope === 'budget' && alert.id !== 'month-missing')

  const netAmount = useNumberInput(state.income.netAmount, (value) =>
    setIncome({ netAmount: value }),
  )
  const customInterval = useNumberInput(state.income.customIntervalDays, (value) =>
    setIncome({ customIntervalDays: Math.max(1, Math.round(value)) }),
  )
  const monthIncome = useNumberInput(view.income, (value) => {
    if (!view.month) return
    saveBudgetMonth({ ...view.month, income: Math.max(0, value) })
  })

  const slices: DoughnutSlice[] = view.categories
    .filter((category) => category.amount > 0)
    .map((category) => ({
      id: category.id,
      label: category.label || t(`presets.${category.preset}.label`),
      amount: category.amount,
      color: category.color,
    }))

  const openCreate = () => {
    if (needsMonth) return
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }

  const saveCategory = (category: ExpenseCategory) => {
    if (view.isVariable) {
      if (view.monthKey) upsertBudgetCategory(view.monthKey, category)
    } else {
      upsertCategory(category)
    }
  }

  const handleSave = (category: ExpenseCategory) => {
    saveCategory(category)
    setDialogOpen(false)
    setSelectedId(category.id)
  }

  const handleRemove = (id: string) => {
    if (view.isVariable) {
      if (view.monthKey) removeBudgetCategory(view.monthKey, id)
    } else {
      removeCategory(id)
    }
    setSelectedId((current) => (current === id ? null : current))
    setDialogOpen(false)
  }

  const handleModeChange = (mode: BudgetMode) => {
    if (mode === state.settings.budgetMode) return

    // El primer mes variable parte del presupuesto fijo para no perder datos.
    if (mode === 'variable' && state.budgets.length === 0) {
      const key = currentMonthKey()
      saveBudgetMonth(
        createMonthBudget(key, state.income.netAmount, state.categories, true),
      )
      setActiveMonth(key)
    }
    setBudgetMode(mode)
  }

  const createSelectedMonth = () => {
    const key = view.monthKey ?? currentMonthKey()
    const template = state.budgets.at(-1)?.categories ?? state.categories
    const seedAmounts = state.budgets.length === 0
    saveBudgetMonth(
      createMonthBudget(
        key,
        seedAmounts ? state.income.netAmount : 0,
        template,
        seedAmounts,
      ),
    )
    setActiveMonth(key)
  }

  const monthName = view.monthKey ? monthLabel(view.monthKey, locale) : ''
  const isCurrentMonth = view.monthKey === currentMonthKey()

  return (
    <div className="animate-fade-up space-y-4">
      <SectionHeader title={t('partition.title')} description={t('partition.subtitle')} />

      {/* Modo de presupuesto */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{t('partition.mode')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {state.settings.budgetMode === 'variable'
              ? t('partition.modeVariableHint')
              : t('partition.modeFixedHint')}
          </p>
        </div>
        <SegmentedControl
          value={state.settings.budgetMode}
          onChange={handleModeChange}
          ariaLabel={t('partition.mode')}
          options={[
            {
              value: 'fixed',
              label: t('partition.modeFixed'),
              icon: <WalletIcon className="h-4 w-4" />,
            },
            {
              value: 'variable',
              label: t('partition.modeVariable'),
              icon: <CalendarIcon className="h-4 w-4" />,
            },
          ]}
          className="sm:w-auto"
        />
      </Card>

      {alerts.length > 0 ? <SmartAlerts alerts={alerts} limit={2} /> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {/* Ingreso / mes */}
        <Card className="space-y-4 p-5">
          {view.isVariable ? (
            <>
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface-2 p-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('partition.prevMonth')}
                  onClick={() => setActiveMonth(shiftMonth(view.monthKey ?? currentMonthKey(), -1))}
                  className="px-2.5"
                >
                  <ChevronLeftIcon className="h-4.5 w-4.5" />
                </Button>
                <div className="min-w-0 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('partition.monthBudget')}
                  </p>
                  <p className="truncate text-sm font-semibold capitalize text-text">{monthName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('partition.nextMonth')}
                  onClick={() => setActiveMonth(shiftMonth(view.monthKey ?? currentMonthKey(), 1))}
                  className="px-2.5"
                >
                  <ChevronRightIcon className="h-4.5 w-4.5" />
                </Button>
              </div>

              {!isCurrentMonth ? (
                <button
                  type="button"
                  onClick={() => setActiveMonth(currentMonthKey())}
                  className="mx-auto block text-xs font-medium text-primary-strong underline-offset-4 hover:underline"
                >
                  {t('partition.thisMonth')}
                </button>
              ) : null}

              {view.month ? (
                <>
                  <Field
                    label={t('partition.monthIncome')}
                    htmlFor="month-income"
                    hint={t('partition.netAmountHint')}
                  >
                    <AffixedInput
                      id="month-income"
                      inputMode="decimal"
                      prefix={currencySymbol}
                      value={monthIncome.value}
                      onChange={monthIncome.onChange}
                      placeholder="0"
                    />
                  </Field>

                  <div className="rounded-xl bg-surface-2 px-3.5 py-3 text-sm text-muted">
                    {t('partition.payday')}:{' '}
                    <span className="font-medium text-text">
                      {formatDate(nextPayday(state.income))}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 text-danger hover:bg-danger-soft hover:text-on-danger-soft"
                    icon={<TrashIcon className="h-4 w-4" />}
                    onClick={() => setRemoveMonthOpen(true)}
                  >
                    {t('partition.removeMonth')}
                  </Button>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-semibold text-text">{t('partition.monthMissingTitle')}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {t('partition.monthMissingText')}
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    icon={<PlusIcon className="h-4 w-4" />}
                    onClick={createSelectedMonth}
                  >
                    {t('partition.createMonthBudget', { month: monthName })}
                  </Button>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  {t('partition.referenceCalendar')}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  {t('partition.referenceHint')}
                </p>
                <div className="mt-3 space-y-3">
                  <Field label={t('partition.payFrequency')} htmlFor="pay-frequency">
                    <Select
                      id="pay-frequency"
                      value={state.income.payFrequency}
                      onChange={(event) =>
                        setIncome({ payFrequency: event.target.value as PayFrequency })
                      }
                    >
                      <option value="weekly">{t('partition.frequencyWeekly')}</option>
                      <option value="biweekly">{t('partition.frequencyBiweekly')}</option>
                      <option value="monthly">{t('partition.frequencyMonthly')}</option>
                      <option value="custom">{t('partition.frequencyCustom')}</option>
                    </Select>
                  </Field>

                  {state.income.payFrequency === 'custom' ? (
                    <Field label={t('partition.customInterval')} htmlFor="custom-interval">
                      <Input
                        id="custom-interval"
                        type="number"
                        min={1}
                        max={365}
                        value={customInterval.value}
                        onChange={customInterval.onChange}
                      />
                    </Field>
                  ) : null}

                  <Field label={t('partition.payday')} htmlFor="payday-date">
                    <Input
                      id="payday-date"
                      type="date"
                      value={state.income.paydayDate}
                      onChange={(event) => setIncome({ paydayDate: event.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-text">{t('partition.incomeTitle')}</h3>

              <Field
                label={t('partition.netAmount')}
                htmlFor="net-amount"
                hint={t('partition.netAmountHint')}
              >
                <AffixedInput
                  id="net-amount"
                  inputMode="decimal"
                  prefix={currencySymbol}
                  value={netAmount.value}
                  onChange={netAmount.onChange}
                  placeholder="0"
                />
              </Field>

              <Field label={t('partition.payFrequency')} htmlFor="pay-frequency">
                <Select
                  id="pay-frequency"
                  value={state.income.payFrequency}
                  onChange={(event) =>
                    setIncome({ payFrequency: event.target.value as PayFrequency })
                  }
                >
                  <option value="weekly">{t('partition.frequencyWeekly')}</option>
                  <option value="biweekly">{t('partition.frequencyBiweekly')}</option>
                  <option value="monthly">{t('partition.frequencyMonthly')}</option>
                  <option value="custom">{t('partition.frequencyCustom')}</option>
                </Select>
              </Field>

              {state.income.payFrequency === 'custom' ? (
                <Field label={t('partition.customInterval')} htmlFor="custom-interval">
                  <Input
                    id="custom-interval"
                    type="number"
                    min={1}
                    max={365}
                    value={customInterval.value}
                    onChange={customInterval.onChange}
                  />
                </Field>
              ) : null}

              <Field
                label={t('partition.payday')}
                htmlFor="payday-date"
                hint={t('partition.paydayHint')}
              >
                <Input
                  id="payday-date"
                  type="date"
                  value={state.income.paydayDate}
                  onChange={(event) => setIncome({ paydayDate: event.target.value })}
                />
              </Field>

              <div className="rounded-xl bg-surface-2 px-3.5 py-3 text-sm text-muted">
                {t('partition.payday')}:{' '}
                <span className="font-medium text-text">
                  {formatDate(nextPayday(state.income))}
                </span>
              </div>
            </>
          )}
        </Card>

        {/* Torta */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1 basis-48">
              <h3 className="text-sm font-semibold text-text">{t('partition.chartTitle')}</h3>
              <p className="mt-1 text-xs text-muted">
                {view.isVariable ? monthName : t('partition.categoriesHint')}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={openCreate}
              disabled={needsMonth}
            >
              {t('partition.addCategory')}
            </Button>
          </div>

          <div className="h-64 sm:h-80">
            <IncomeChart
              style={state.settings.chartStyle}
              slices={slices}
              income={totals.income}
              assigned={totals.assigned}
              available={totals.remaining}
              centerValue={formatMoney(totals.assigned, 0)}
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
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 sm:text-center">
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs text-muted">{t('partition.totalsIncome')}</p>
                <p className="figure text-sm font-semibold text-text">
                  <AnimatedNumber value={totals.income} format={formatMoney} />
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs text-muted">{t('partition.totalsAssigned')}</p>
                <p className="figure text-sm font-semibold text-primary-strong">
                  <AnimatedNumber value={totals.assigned} format={formatMoney} />
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block">
                <p className="text-xs text-muted">{t('partition.totalsRemaining')}</p>
                <p
                  className={cn(
                    'figure text-sm font-semibold',
                    totals.remaining >= 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  <AnimatedNumber value={totals.remaining} format={formatMoney} />
                </p>
              </div>
            </div>
          </div>

          {totals.isOverBudget ? (
            <p className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-on-danger-soft">
              {t('partition.overBudget', {
                amount: formatMoney(totals.assigned - totals.income),
              })}
            </p>
          ) : null}
        </Card>
      </section>

      {/* Categorías */}
      <Card className="p-5">
        <SectionHeader
          title={t('partition.categories')}
          description={view.isVariable ? monthName : t('partition.categoriesHint')}
          action={
            <Button
              size="sm"
              variant="secondary"
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={openCreate}
              disabled={needsMonth}
            >
              {t('partition.addCategory')}
            </Button>
          }
        />

        {needsMonth ? (
          <EmptyState
            emoji="🗓️"
            title={t('partition.monthMissingTitle')}
            description={t('partition.monthMissingText')}
            action={
              <Button onClick={createSelectedMonth} icon={<PlusIcon className="h-4 w-4" />}>
                {t('partition.createMonthBudget', { month: monthName })}
              </Button>
            }
          />
        ) : view.categories.length === 0 ? (
          <EmptyState
            emoji="🥧"
            title={t('partition.emptyTitle')}
            description={t('partition.emptyText')}
            action={
              <Button onClick={openCreate} icon={<PlusIcon className="h-4 w-4" />}>
                {t('partition.addFirst')}
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {view.categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                share={totals.assigned > 0 ? category.amount / totals.assigned : 0}
                onEdit={() => openEdit(category.id)}
                onRemove={() => handleRemove(category.id)}
                onAmount={(value) => saveCategory({ ...category, amount: value })}
              />
            ))}
          </ul>
        )}
      </Card>

      <CategoryDialog
        open={dialogOpen}
        category={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onRemove={handleRemove}
      />

      <Modal
        open={removeMonthOpen}
        onClose={() => setRemoveMonthOpen(false)}
        title={t('partition.removeMonth')}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRemoveMonthOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (view.monthKey) removeBudgetMonth(view.monthKey)
                setRemoveMonthOpen(false)
              }}
            >
              {t('common.delete')}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          {t('partition.removeMonthConfirm', { month: monthName })}
        </p>
      </Modal>
    </div>
  )
}
