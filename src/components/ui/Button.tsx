import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Icono opcional antes del texto. */
  icon?: ReactNode
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-strong active:scale-[0.98] shadow-[0_1px_2px_rgba(16,20,35,0.06),0_6px_16px_-6px_var(--color-primary)]',
  secondary:
    'bg-surface text-text border border-border hover:border-primary/40 hover:text-primary-strong active:scale-[0.98]',
  ghost: 'text-muted hover:bg-surface-2 hover:text-text active:scale-[0.98]',
  danger:
    'bg-danger text-white hover:opacity-90 active:scale-[0.98] shadow-[0_1px_2px_rgba(16,20,35,0.06),0_6px_16px_-6px_var(--color-danger)]',
  success:
    'bg-success text-white hover:opacity-90 active:scale-[0.98] shadow-[0_1px_2px_rgba(16,20,35,0.06),0_6px_16px_-6px_var(--color-success)]',
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-5 text-base rounded-2xl gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
