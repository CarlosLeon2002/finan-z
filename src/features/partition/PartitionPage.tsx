import { useState } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { IncomeChart, type DoughnutSlice } from '../../charts/IncomeChart'
import { nextPayday } from '../../domain/income'
import { computeTotals } from '../../domain/partition'
import { useNumberInput } from '../../hooks/useNumberInput'
import { cn } from '../../lib/cn'
import type { ExpenseCategory, PayFrequency } from '../../types'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeader } from '../../components/ui/Card'
import { AffixedInput, Field, Input, Select } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/Feedback'
import { PencilIcon, PlusIcon, TrashIcon } from '../../components/ui/Icon'
import { CategoryDialog } from './CategoryDialog'

interface CategoryRowProps {
  category: ExpenseCategory
  /** Participación dentro del total asignado (0..1). */
  share: number
  onEdit: () => void
  onRemove: () => void
}

function CategoryRow({ category, share, onEdit, onRemove }: CategoryRowProps) {
  const { t, formatPercent, currencySymbol } = useI18n()
  const { upsertCategory } = useAppState()
  const amount = useNumberInput(category.amount, (value) =>
    upsertCategory({ ...category, amount: value }),
  )

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
 * Partición del ingreso: monto neto + calendario de cobro a la izquierda,
 * torta interactiva y lista de categorías editables en vivo.
 */
export function PartitionPage() {
  const { state, setIncome, upsertCategory, removeCategory } = useAppState()
  const { t, formatMoney, formatPercent, currencySymbol, formatDate } = useI18n()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const netAmount = useNumberInput(state.income.netAmount, (value) =>
    setIncome({ netAmount: value }),
  )
  const customInterval = useNumberInput(state.income.customIntervalDays, (value) =>
    setIncome({ customIntervalDays: Math.max(1, Math.round(value)) }),
  )

  const totals = computeTotals(state.categories, state.income.netAmount)
  const editing = state.categories.find((category) => category.id === editingId) ?? null

  const slices: DoughnutSlice[] = state.categories
    .filter((category) => category.amount > 0)
    .map((category) => ({
      id: category.id,
      label: category.label || t(`presets.${category.preset}.label`),
      amount: category.amount,
      color: category.color,
    }))

  const openCreate = () => {
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }

  const handleSave = (category: ExpenseCategory) => {
    upsertCategory(category)
    setDialogOpen(false)
    setSelectedId(category.id)
  }

  const handleRemove = (id: string) => {
    removeCategory(id)
    setSelectedId((current) => (current === id ? null : current))
    setDialogOpen(false)
  }

  return (
    <div className="animate-fade-up space-y-4">
      <SectionHeader title={t('partition.title')} description={t('partition.subtitle')} />

      <section className="grid gap-4 lg:grid-cols-3">
        {/* Ingreso */}
        <Card className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-text">{t('partition.incomeTitle')}</h3>

          <Field label={t('partition.netAmount')} htmlFor="net-amount" hint={t('partition.netAmountHint')}>
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
              onChange={(event) => setIncome({ payFrequency: event.target.value as PayFrequency })}
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

          <Field label={t('partition.payday')} htmlFor="payday-date" hint={t('partition.paydayHint')}>
            <Input
              id="payday-date"
              type="date"
              value={state.income.paydayDate}
              onChange={(event) => setIncome({ paydayDate: event.target.value })}
            />
          </Field>

          <div className="rounded-xl bg-surface-2 px-3.5 py-3 text-sm text-muted">
            {t('partition.payday')}:{' '}
            <span className="font-medium text-text">{formatDate(nextPayday(state.income))}</span>
          </div>
        </Card>

        {/* Torta */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1 basis-48">
              <h3 className="text-sm font-semibold text-text">{t('partition.chartTitle')}</h3>
              <p className="mt-1 text-xs text-muted">{t('partition.categoriesHint')}</p>
            </div>
            <Button size="sm" variant="secondary" icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
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
              {t('partition.overBudget', { amount: formatMoney(totals.assigned - totals.income) })}
            </p>
          ) : null}
        </Card>
      </section>

      {/* Categorías */}
      <Card className="p-5">
        <SectionHeader
          title={t('partition.categories')}
          description={t('partition.categoriesHint')}
          action={
            <Button size="sm" variant="secondary" icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
              {t('partition.addCategory')}
            </Button>
          }
        />

        {state.categories.length === 0 ? (
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
            {state.categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                share={totals.assigned > 0 ? category.amount / totals.assigned : 0}
                onEdit={() => openEdit(category.id)}
                onRemove={() => handleRemove(category.id)}
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
    </div>
  )
}
