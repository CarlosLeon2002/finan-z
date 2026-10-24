import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../app/i18n'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/Feedback'
import { CheckIcon } from '../../components/ui/Icon'
import { celebrateGoal } from '../../lib/confetti'

interface GoalCompletedDialogProps {
  open: boolean
  title: string
  target: number
  saved: number
  onClose: () => void
}

/**
 * Pantalla de celebración al cruzar el 100 % de una meta.
 * Confeti con los colores del tema, anillo pulsante y resumen de lo logrado.
 */
export function GoalCompletedDialog({
  open,
  title,
  target,
  saved,
  onClose,
}: GoalCompletedDialogProps) {
  const { t, formatMoney } = useI18n()
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    celebrateGoal()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Captura: evita que Escape cierre también el detalle que hay debajo.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-completed-title"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm animate-pop overflow-y-auto rounded-[1.75rem] border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(10,14,26,0.65)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-28 h-56"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in oklab, var(--color-success) 28%, transparent), transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-16 h-48 w-48 rounded-full opacity-40 blur-2xl"
          style={{ background: 'var(--color-primary-soft)' }}
        />

        <div className="relative p-6 text-center">
          <div className="relative mx-auto grid h-24 w-24 place-items-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping-slow rounded-full bg-success/25"
            />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-surface text-success shadow-lg shadow-success/35 ring-4 ring-white/25">
              <CheckIcon className="h-8 w-8" strokeWidth={2.4} />
            </span>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
            {t('savings.completedBadge')}
          </p>
          <h2
            id="goal-completed-title"
            className="mt-1 text-xl font-semibold tracking-tight text-text"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {t('savings.completedText', { amount: formatMoney(target), title })}
          </p>

          <div className="mt-5 rounded-2xl border border-border bg-surface-2/70 p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted">{t('savings.completedTotal')}</span>
              <AnimatedNumber
                value={saved}
                format={formatMoney}
                className="figure text-lg font-semibold text-text"
              />
            </div>
            <ProgressBar value={1} tone="success" className="mt-2.5" label={title} />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
              <span>
                {t('savings.targetLine')}: {formatMoney(target)}
              </span>
              <span className="font-semibold text-success">100 %</span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted">{t('savings.completedHint')}</p>

          <Button className="mt-5 w-full" onClick={onClose}>
            {t('savings.completedClose')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
