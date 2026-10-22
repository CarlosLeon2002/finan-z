import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  /** Etiqueta accesible del grupo (se anuncia a lectores de pantalla). */
  ariaLabel?: string
}

/**
 * Control segmentado: alternativa limpia a varios radio buttons
 * (duración, modo de plazo, idioma...).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap gap-1 rounded-2xl border border-border bg-surface-2 p-1',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-w-0 flex-auto items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all sm:px-3',
              isActive
                ? 'bg-surface text-primary-strong shadow-sm'
                : 'text-muted hover:text-text',
            )}
          >
            {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
