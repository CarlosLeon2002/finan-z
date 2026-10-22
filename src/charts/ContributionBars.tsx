import { useMemo } from 'react'
import type { ChartOptions, ScriptableContext } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { Contribution } from '../types'
import { fromISO } from '../lib/dates'
import { cn } from '../lib/cn'
import { CHART_FONT, chartGradient, mixColor, useChartPalette } from './chartTheme'
import { createExternalTooltip } from './chartTooltip'
import './register'

interface ContributionBarsProps {
  contributions: Contribution[]
  emptyLabel: string
  ariaSummary: string
  formatAmount: (value: number) => string
  /** Formatea una fecha (día del mes, ej. “15 oct”). */
  formatDate: (value: string | Date) => string
  className?: string
}

/**
 * Barras verticales de cada aporte en orden cronológico.
 * El aporte más alto se destaca con el acento activo y un degradado; el resto
 * se mantiene en un tono suave para no competir visualmente.
 */
export function ContributionBars({
  contributions,
  emptyLabel,
  ariaSummary,
  formatAmount,
  formatDate,
  className,
}: ContributionBarsProps) {
  const palette = useChartPalette()

  const ordered = useMemo(
    () => [...contributions].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [contributions],
  )

  const max = useMemo(
    () => ordered.reduce((peak, item) => Math.max(peak, item.amount), 0),
    [ordered],
  )

  // Tono intermedio para los aportes que no son el mayor: visible sobre el
  // fondo, pero sin robarle protagonismo al pico.
  const secondary = mixColor(palette.primary, palette.surface, palette.isDark ? 0.45 : 0.55)
  const colorFor = (amount: number) => (amount === max ? palette.primary : secondary)

  if (ordered.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full min-h-32 items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center',
          className,
        )}
      >
        <span className="text-sm font-medium text-muted">{emptyLabel}</span>
      </div>
    )
  }

  const data = {
    labels: ordered.map((item) => formatDate(fromISO(item.date))),
    datasets: [
      {
        data: ordered.map((item) => item.amount),
        backgroundColor: (context: ScriptableContext<'bar'>) => {
          const item = ordered[context.dataIndex]
          const base = colorFor(item?.amount ?? 0)
          return chartGradient(context.chart, base, {
            axis: 'vertical',
            light: palette.isDark ? 0.26 : 0.2,
            dark: palette.isDark ? 0.24 : 0.14,
          })
        },
        borderRadius: 9,
        borderSkipped: false,
        barPercentage: 0.62,
        categoryPercentage: 0.9,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 780, easing: 'easeOutQuart' },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: palette.text,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
          font: { family: CHART_FONT, size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: palette.grid, drawTicks: false },
        border: { display: false },
        ticks: {
          color: palette.text,
          maxTicksLimit: 3,
          font: { family: CHART_FONT, size: 10 },
          callback: (value) => formatAmount(Number(value)),
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        external: createExternalTooltip(palette, (point) =>
          colorFor(ordered[point.dataIndex]?.amount ?? 0),
        ),
        callbacks: {
          label: (context) => formatAmount(Number(context.parsed.y)),
        },
      },
    },
  }

  return (
    <div
      role="img"
      aria-label={ariaSummary}
      className={cn('relative h-full min-h-32 w-full', className)}
    >
      <Bar data={data} options={options} />
    </div>
  )
}
