import { useId, useMemo } from 'react'
import { useTheme } from '../theme/theme'
import { cn } from '../lib/cn'

interface SparklineProps {
  /** Serie de valores en orden; se normaliza internamente al alto del trazo. */
  values: number[]
  className?: string
  /** Relleno degradado bajo la línea (por defecto activo). */
  area?: boolean
}

/**
 * Micro-línea de tendencia dibujada con SVG para las tarjetas de métricas:
 * más ligera que un <canvas> de Chart.js y nítida en pantallas densas.
 * Usa el color de acento activo.
 */
export function Sparkline({ values, className, area = true }: SparklineProps) {
  const gradientId = useId()
  const { accent } = useTheme()

  const { linePath, areaPath } = useMemo(() => {
    const clean = values.filter((value) => Number.isFinite(value))
    if (clean.length < 2) return { linePath: '', areaPath: '' }

    const width = 100
    const height = 32
    const min = Math.min(...clean)
    const max = Math.max(...clean)
    const span = max - min || 1

    const points = clean.map((value, index) => {
      const x = (index / (clean.length - 1)) * width
      // Dejo un pequeño margen vertical para que el trazo no toque los bordes.
      const y = height - 3 - ((value - min) / span) * (height - 6)
      return [x, y] as const
    })

    const line = points
      .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(' ')
    const areaFill = `${line} L${width},${height} L0,${height} Z`

    return { linePath: line, areaPath: areaFill }
  }, [values])

  if (!linePath) return null

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn('h-8 w-full', className)}
      aria-hidden="true"
      data-accent={accent}
    >
      {area ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
        </>
      ) : null}
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
