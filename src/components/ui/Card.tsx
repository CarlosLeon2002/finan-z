import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Superficie base de la app: borde suave, esquinas grandes y sombra sutil. */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(16,20,35,0.04),0_8px_24px_-12px_rgba(16,20,35,0.10)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

/** Título de sección con acción a la derecha (botón “agregar”, etc.). */
export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0 flex-1 basis-60">
        <h2 className="text-lg font-semibold tracking-tight text-text">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
