import { useId } from 'react'
import { cn } from '../../lib/cn'

interface BrandMarkProps {
  className?: string
  /** Cuando se indica, el icono se anuncia con ese nombre. */
  label?: string
}

/**
 * Marca de Finan-Z: una Z limpia sobre un cuadrado verde con profundidad sutil.
 * Es la misma forma que usan el favicon y los iconos de la PWA.
 */
export function BrandMark({ className, label }: BrandMarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const backgroundId = `fz-mark-bg-${uid}`
  const shineId = `fz-mark-shine-${uid}`

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <defs>
        <linearGradient
          id={backgroundId}
          x1="10"
          y1="5"
          x2="54"
          y2="59"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#21A97A" />
          <stop offset="0.52" stopColor="#0F7A55" />
          <stop offset="1" stopColor="#075A40" />
        </linearGradient>
        <linearGradient
          id={shineId}
          x1="12"
          y1="6"
          x2="34"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${backgroundId})`} />
      <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${shineId})`} />
      <path
        d="M20 22h24L20 42h24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface BrandLockupProps {
  className?: string
  markClassName?: string
  subtitle?: string
  subtitleClassName?: string
}

/** Icono + nombre, listos para la cabecera o una pantalla de bienvenida. */
export function BrandLockup({
  className,
  markClassName,
  subtitle,
  subtitleClassName,
}: BrandLockupProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark className={cn('h-9 w-9', markClassName)} />
      <span className="min-w-0 leading-tight">
        <span className="block font-heading text-[15px] font-semibold tracking-[-0.02em] text-text">
          Finan-Z
        </span>
        {subtitle ? (
          <span className={cn('mt-0.5 block truncate text-[11px] text-muted', subtitleClassName)}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  )
}
