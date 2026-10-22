import type { ChartOptions, ScriptableContext } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { cn } from '../lib/cn'
import { chartGradient, useChartPalette } from './chartTheme'
import './register'

interface AllocationGaugeProps {
  /** Asignado ya destinado (0..income). */
  assigned: number
  /** Ingreso neto total (base del 100 %). */
  income: number
  centerValue: string
  centerLabel: string
  emptyLabel: string
  ariaSummary: string
  className?: string
}

/**
 * Medidor radial: un anillo abierto de 280° donde el arco activo representa la
 * parte del ingreso ya asignada. El arco lleva degradado y extremos redondeados;
 * el centro es HTML para conservar la tipografía de cifras.
 */
export function AllocationGauge({
  assigned,
  income,
  centerValue,
  centerLabel,
  emptyLabel,
  ariaSummary,
  className,
}: AllocationGaugeProps) {
  const palette = useChartPalette()

  const safeIncome = Math.max(0, income)
  const clamped = Math.min(safeIncome, Math.max(0, assigned))
  const hasData = safeIncome > 0

  if (!hasData) {
    return (
      <div className={cn('mx-auto flex aspect-square w-full max-w-56 items-center justify-center', className)}>
        <div
          className="flex h-full w-full items-center justify-center rounded-full border-[14px] px-8 text-center"
          style={{ borderColor: palette.track }}
        >
          <span className="text-sm font-medium leading-snug text-muted">{emptyLabel}</span>
        </div>
      </div>
    )
  }

  const data = {
    labels: ['assigned', 'available'],
    datasets: [
      {
        data: [clamped, Math.max(0, safeIncome - clamped)],
        backgroundColor: (context: ScriptableContext<'doughnut'>) =>
          context.dataIndex === 0
            ? chartGradient(context.chart, palette.primary, {
                axis: 'horizontal',
                light: palette.isDark ? 0.26 : 0.2,
                dark: palette.isDark ? 0.22 : 0.16,
              })
            : palette.track,
        borderWidth: 0,
        borderRadius: 14,
        spacing: 2,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '78%',
    circumference: 280,
    rotation: 220,
    layout: { padding: 10 },
    animation: { animateRotate: true, duration: 950, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }

  return (
    <div
      role="img"
      aria-label={ariaSummary}
      className={cn('relative mx-auto h-full min-h-48 w-full', className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 62%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 60%)',
        }}
      />
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center pb-4">
        <div className="max-w-[58%] text-center">
          <p
            key={centerValue}
            className="figure animate-pop text-[26px] font-semibold leading-none tracking-tight text-primary-strong sm:text-3xl"
          >
            {centerValue}
          </p>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            {centerLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
