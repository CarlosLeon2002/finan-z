import { cn } from '../lib/cn'

interface ProgressRingProps {
  /** Avance entre 0 y 1. */
  value: number
  /** Diámetro en píxeles. */
  size?: number
  strokeWidth?: number
  className?: string
  /** Contenido central (ej. emoji del objetivo o porcentaje). */
  children?: React.ReactNode
  /** Color del arco activo; por defecto usa el acento actual. */
  trackColor?: string
}

/**
 * Anillo de progreso dibujado con SVG: ideal para tarjetas donde un <canvas>
 * por cada meta sería pesado. Hereda el color del acento vía `currentColor`
 * y anima el arco con una transición suave.
 */
export function ProgressRing({
  value,
  size = 56,
  strokeWidth = 6,
  className,
  children,
  trackColor,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference * clamped

  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-valuenow={Math.round(clamped * 100)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={trackColor ?? 'var(--color-surface-2)'}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      {children ? (
        <span className="absolute inset-0 grid place-items-center text-xs font-semibold">
          {children}
        </span>
      ) : null}
    </div>
  )
}
