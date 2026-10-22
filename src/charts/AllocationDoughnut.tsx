import type { ChartOptions, ScriptableContext } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { cn } from '../lib/cn'
import { chartGradient, useChartPalette } from './chartTheme'
import { createExternalTooltip } from './chartTooltip'
import './register'

export interface DoughnutSlice {
  id: string
  label: string
  amount: number
  color: string
}

interface AllocationDoughnutProps {
  slices: DoughnutSlice[]
  /** Total sobre el que se calculan los porcentajes (asignado o ingreso). */
  total: number
  centerValue: string
  centerLabel: string
  emptyLabel: string
  ariaSummary: string
  formatAmount: (value: number) => string
  /** Porcentaje del total ya formateado según el idioma activo. */
  formatShare: (amount: number) => string
  onSelect?: (id: string) => void
  selectedId?: string | null
  className?: string
}

/**
 * Torta interactiva de la partición:
 * - sectores con degradado y separación fina entre ellos,
 * - total asignado en el centro (HTML, no canvas: hereda la tipografía),
 * - sector seleccionado destacado hacia afuera,
 * - tooltip flotante HTML al pasar el puntero o tocar.
 */
export function AllocationDoughnut({
  slices,
  total,
  centerValue,
  centerLabel,
  emptyLabel,
  ariaSummary,
  formatAmount,
  formatShare,
  onSelect,
  selectedId,
  className,
}: AllocationDoughnutProps) {
  const palette = useChartPalette()

  if (total <= 0 || slices.length === 0) {
    return (
      <div className={cn('mx-auto flex aspect-square w-full max-w-56 items-center justify-center', className)}>
        <div
          className="flex h-full w-full items-center justify-center rounded-full border-[14px] px-8 text-center"
          style={{ borderColor: palette.track }}
        >
          <span className="text-sm font-medium leading-snug" style={{ color: palette.text }}>
            {emptyLabel}
          </span>
        </div>
      </div>
    )
  }

  const colorAt = (context: ScriptableContext<'doughnut'>) =>
    slices[context.dataIndex]?.color ?? palette.primary

  const data = {
    labels: slices.map((slice) => slice.label),
    datasets: [
      {
        data: slices.map((slice) => slice.amount),
        backgroundColor: (context: ScriptableContext<'doughnut'>) =>
          chartGradient(context.chart, colorAt(context), {
            axis: 'diagonal',
            light: palette.isDark ? 0.3 : 0.26,
            dark: palette.isDark ? 0.28 : 0.2,
          }),
        borderWidth: 0,
        borderRadius: 9,
        spacing: 3,
        offset: slices.map((slice) => (slice.id === selectedId ? 8 : 0)),
        hoverOffset: 12,
        hoverBorderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    layout: { padding: 8 },
    interaction: { mode: 'nearest', intersect: true },
    animation: { animateRotate: true, animateScale: false, duration: 850, easing: 'easeOutQuart' },
    onClick: (_event, elements) => {
      const element = elements[0]
      if (!element || !onSelect) return
      onSelect(slices[element.index].id)
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        external: createExternalTooltip(palette, (point) =>
          slices[point.dataIndex]?.color ?? palette.primary,
        ),
        callbacks: {
          label(context) {
            const amount = Number(context.parsed)
            return `${formatAmount(amount)} · ${formatShare(amount)}`
          },
        },
      },
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
            'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 62%)',
        }}
      />
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="max-w-[58%] text-center">
          <p
            key={centerValue}
            className="figure animate-pop text-[22px] font-semibold leading-none tracking-tight text-primary-strong sm:text-2xl"
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
