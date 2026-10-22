import { useState } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { SAVINGS_METHODS } from '../../domain/methods'
import { findObjective } from '../../domain/objectives'
import { computeGoal } from '../../domain/savings'
import { ProgressRing } from '../../charts/ProgressRing'
import { TERM_LABEL_KEY } from '../../i18n/keys'
import { cn } from '../../lib/cn'
import type { SavingsGoal } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeader } from '../../components/ui/Card'
import { Badge, EmptyState, ProgressBar } from '../../components/ui/Feedback'
import { CheckIcon, PencilIcon, PlusIcon } from '../../components/ui/Icon'
import { GoalDetailDialog } from './GoalDetailDialog'
import { GoalDialog } from './GoalDialog'
import { describePerPeriod } from './periodText'

interface GoalCardProps {
  goal: SavingsGoal
  onOpen: () => void
  onEdit: () => void
}

function GoalCard({ goal, onOpen, onEdit }: GoalCardProps) {
  const i18n = useI18n()
  const { t, formatMoney, formatPercent, formatDate } = i18n
  const math = computeGoal(goal)
  const objective = findObjective(goal.objective)
  const isComplete = math.target > 0 && math.currentSaved >= math.target
  const tone = isComplete || math.isOnTrack ? 'success' : math.isOverdue ? 'danger' : 'warning'

  return (
    <Card className={cn('flex flex-col p-5', isComplete && 'border-success/40 shadow-sm shadow-success/10')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProgressRing
            value={math.progress}
            size={44}
            strokeWidth={5}
            className={
              tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-warning'
            }
          >
            {isComplete ? (
              <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
            ) : (
              <span className="text-base leading-none">{objective.emoji}</span>
            )}
          </ProgressRing>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{goal.title}</p>
            <p className="truncate text-xs text-muted">{t(objective.titleKey)}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={t('common.edit')}
          onClick={onEdit}
          className="rounded-xl p-2 text-muted transition hover:bg-surface-2 hover:text-text"
        >
          <PencilIcon className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {t('savings.saved')}:{' '}
            <span className="font-semibold text-text">{formatMoney(math.currentSaved)}</span>
          </span>
          <span className={isComplete ? 'font-semibold text-success' : 'font-semibold text-primary-strong'}>
            {formatPercent(math.progress)}
          </span>
        </div>
        <ProgressBar value={math.progress} tone={tone} className="mt-2" label={goal.title} />
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
          <span>
            {formatMoney(math.currentSaved)} / {formatMoney(math.target)}
          </span>
          {isComplete ? null : (
            <span>
              {math.isOverdue
                ? t('savings.overdue')
                : math.daysLeft === 1
                  ? t('savings.daysLeftOne')
                  : t('savings.daysLeft', { days: math.daysLeft })}
            </span>
          )}
        </div>
      </div>

      {isComplete ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-success/25 bg-success-soft px-3 py-2.5">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-on-success-soft" strokeWidth={2.5} />
          <p className="text-xs leading-relaxed text-on-success-soft">{t('savings.completedHint')}</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-3 text-center">
          <div className="min-w-0">
            <p className="truncate text-[11px] leading-tight text-muted">{t('savings.falta')}</p>
            <p className="figure mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight text-text sm:text-[13px]">
              {formatMoney(math.remaining, 0)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] leading-tight text-muted">{t('savings.perPeriod')}</p>
            <p className="figure mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight text-text sm:text-[13px]">
              {formatMoney(math.requiredPerPeriod, 0)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] leading-tight text-muted">{t('savings.deadline')}</p>
            <p className="figure mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight text-text sm:text-[13px]">
              {formatDate(math.endDate)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <Badge tone={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'primary'}>
          {isComplete ? t('savings.completedBadge') : t(TERM_LABEL_KEY[math.term])}
        </Badge>
        <Button size="sm" variant="secondary" onClick={onOpen}>
          {t('savings.openDetail')}
        </Button>
      </div>

      {isComplete ? null : (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
          {describePerPeriod(i18n, math)}
        </p>
      )}
    </Card>
  )
}

/** Sección de metas: tarjetas, alta/edición y catálogo de métodos. */
export function SavingsPage() {
  const { t } = useI18n()
  const { state, saveGoal, removeGoal } = useAppState()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)

  const detailGoal = state.goals.find((goal) => goal.id === detailId) ?? null
  const goals = state.goals
    .map((goal) => ({ goal, math: computeGoal(goal) }))
    .sort((a, b) => a.math.endDate.getTime() - b.math.endDate.getTime())

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (goal: SavingsGoal) => {
    setEditing(goal)
    setFormOpen(true)
  }

  const handleSave = (goal: SavingsGoal) => {
    saveGoal(goal)
    setFormOpen(false)
  }

  const handleRemove = (id: string) => {
    removeGoal(id)
    if (detailId === id) setDetailId(null)
  }

  return (
    <div className="animate-fade-up space-y-4">
      <SectionHeader
        title={t('savings.title')}
        description={t('savings.subtitle')}
        action={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
            {t('savings.newGoal')}
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title={t('savings.emptyTitle')}
          description={t('savings.emptyText')}
          action={
            <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
              {t('savings.createFirst')}
            </Button>
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map(({ goal }) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onOpen={() => setDetailId(goal.id)}
              onEdit={() => openEdit(goal)}
            />
          ))}
        </section>
      )}

      {/* Catálogo de métodos */}
      <Card className="p-5">
        <SectionHeader
          title={t('savings.methodsCatalog')}
          description={t('savings.methodsCatalogHint')}
          action={
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={showCatalog}
              onClick={() => setShowCatalog((value) => !value)}
            >
              {showCatalog ? t('common.close') : t('savings.allMethods')}
            </Button>
          }
        />

        {showCatalog ? (
          <ul className="space-y-3">
            {SAVINGS_METHODS.map((method) => (
              <li key={method.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-text">{t(method.titleKey)}</p>
                  <div className="flex flex-wrap gap-1">
                    {method.horizons.map((horizon) => (
                      <Badge key={horizon} tone="primary">
                        {t(TERM_LABEL_KEY[horizon])}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(method.summaryKey)}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  <span className="font-medium text-text">{t('savings.methodSource')}:</span>{' '}
                  {t(method.sourceKey)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t('savings.recommendedHint')}</p>
        )}
      </Card>

      <GoalDialog
        open={formOpen}
        goal={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <GoalDetailDialog
        open={detailGoal !== null}
        goal={detailGoal}
        onClose={() => setDetailId(null)}
        onRemove={handleRemove}
      />
    </div>
  )
}
