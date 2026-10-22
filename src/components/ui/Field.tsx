import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from './Icon'

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  htmlFor?: string
  children: ReactNode
  className?: string
}

/** Etiqueta + control + ayuda: mantiene todos los formularios alineados. */
export function Field({ label, hint, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  )
}

const CONTROL_CLASS =
  'h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-text ' +
  'placeholder:text-muted/70 transition-colors focus:border-primary focus:bg-surface ' +
  'focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ className, invalid, ...props }: InputProps) {
  return <input className={cn(CONTROL_CLASS, invalid && 'border-danger', className)} {...props} />
}

interface AffixedInputProps extends Omit<InputProps, 'prefix'> {
  /** Símbolo monetario mostrado a la izquierda (no afecta el valor). */
  prefix?: ReactNode
  suffix?: ReactNode
}

export function AffixedInput({ prefix, suffix, className, ...props }: AffixedInputProps) {
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-muted">
          {prefix}
        </span>
      ) : null}
      <Input
        className={cn(Boolean(prefix) && 'pl-9', Boolean(suffix) && 'pr-14', className)}
        {...props}
      />
      {suffix ? (
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-muted">
          {suffix}
        </span>
      ) : null}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

/** `select` nativo (teclado y accesibilidad incluidos) con flecha propia. */
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select className={cn(CONTROL_CLASS, 'appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4.5 w-4.5 text-muted" />
    </div>
  )
}
