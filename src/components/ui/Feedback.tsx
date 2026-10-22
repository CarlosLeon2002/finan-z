import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ProgressBarProps {
  /** Avance entre 0 y 1. */
  value: number
  tone?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
  label?: string
}

const TONE_GRADIENT = {
  primary: 'from-primary/70 to-primary',
  success: 'from-success/70 to-success',
  warning: 'from-warning/70 to-warning',
  danger: 'from-danger/70 to-danger',
} as const

export function ProgressBar({ value, tone = 'primary', className, label }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
  const percent = Math.round(clamped * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out',
          TONE_GRADIENT[tone],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const BADGE_CLASS: Record<BadgeTone, string> = {
  primary: 'bg-primary-soft text-on-primary-soft',
  success: 'bg-success-soft text-on-success-soft',
  warning: 'bg-warning-soft text-on-warning-soft',
  danger: 'bg-danger-soft text-on-danger-soft',
  neutral: 'border border-border bg-surface-2 text-muted',
}

/** Etiqueta compacta de estado (plazo, método, “en camino”...). */
export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        BADGE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

interface ChipProps {
  selected?: boolean
  onClick?: () => void
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/** Chip seleccionable: objetivos, colores, iconos y filtros. */
export function Chip({ selected, onClick, icon, children, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
        selected
          ? 'border-primary bg-primary-soft text-on-primary-soft shadow-sm'
          : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-text',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ emoji, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-10 text-center',
        className,
      )}
    >
      {emoji ? <span className="mb-3 text-4xl">{emoji}</span> : null}
      <p className="text-sm font-semibold text-text">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
