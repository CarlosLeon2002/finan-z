import { useMemo } from 'react'
import type { ChartOptions, Plugin, ScriptableContext } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { cn } from '../lib/cn'
import { CHART_FONT, chartGradient, useChartPalette } from './chartTheme'
import { createExternalTooltip } from './chartTooltip'
import './register'

export interface RankRow {
  id: string
  label: string
  emoji: string
  amount: number
  color: string
}

interface CategoryRankingProps {
  rows: RankRow[]
  emptyLabel: string
  ariaSummary: string
  formatAmount: (value: number) => string
  formatShare: (amount: number) => string
  onSelect?: (id: string) => void
  selectedId?: string | null
  className?: string
}

/**
 * Barras horizontales ordenadas de mayor a menor gasto.
 * Cada barra lleva el degradado de su categoría y el importe dibujado dentro
 * (o al lado, si la barra es corta) para que la lectura sea inmediata.
 */
export function CategoryRanking({
  rows,
  emptyLabel,
  ariaSummary,
  formatAmount,
  formatShare,
  onSelect,
  selectedId,
  className,
}: CategoryRankingProps) {
  const palette = useChartPalette()

  const sorted = useMemo(() => [...rows].sort((a, b) => b.amount - a.amount), [rows])

  const valueLabels = useMemo<Plugin<'bar'>>(
    () => ({
      id: 'rankValueLabels',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart
        if (!chartArea) return
        const meta = chart.getDatasetMeta(0)
        const values = chart.data.datasets[0]?.data ?? []

        ctx.save()
        ctx.font = `600 11px 'Outfit', ${CHART_FONT}`
        ctx.textBaseline = 'middle'

        meta.data.forEach((element, index) => {
          const bar = element as unknown as { x: number; y: number; base: number }
          const text = formatAmount(Number(values[index] ?? 0))
          const width = Math.abs(bar.x - bar.base)
          const textWidth = ctx.measureText(text).width

          if (width > textWidth + 22) {
            ctx.textAlign = 'right'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
            ctx.fillText(text, bar.x - 8, bar.y)
          } else {
            ctx.textAlign = 'left'
            ctx.fillStyle = palette.text
            ctx.fillText(text, bar.x + 7, bar.y)
          }
        })

        ctx.restore()
      },
    }),
    [formatAmount, palette.text],
  )

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full min-h-48 items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center',
          className,
        )}
      >
        <span className="text-sm font-medium text-muted">{emptyLabel}</span>
      </div>
    )
  }

  const colorAt = (context: ScriptableContext<'bar'>) => {
    const row = sorted[context.dataIndex]
    if (!row) return palette.primary
    return selectedId && row.id === selectedId ? palette.primaryStrong : row.color
  }

  const data = {
    labels: sorted.map((row) => row.label),
    datasets: [
      {
        data: sorted.map((row) => row.amount),
        backgroundColor: (context: ScriptableContext<'bar'>) =>
          chartGradient(context.chart, colorAt(context), {
            axis: 'horizontal',
            light: palette.isDark ? 0.24 : 0.18,
            dark: palette.isDark ? 0.26 : 0.18,
          }),
        borderRadius: 9,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.88,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    layout: { padding: { right: 8, top: 2, bottom: 2 } },
    onClick: (_event, elements) => {
      const element = elements[0]
      if (!element || !onSelect) return
      onSelect(sorted[element.index].id)
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: palette.grid, drawTicks: false },
        border: { display: false },
        ticks: {
          color: palette.text,
          maxTicksLimit: 3,
          maxRotation: 0,
          autoSkip: true,
          font: { family: CHART_FONT, size: 10 },
          callback: (value) => formatAmount(Number(value)),
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: palette.strong,
          font: { family: CHART_FONT, size: 12, weight: 500 },
          crossAlign: 'far',
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        external: createExternalTooltip(palette, (point) =>
          sorted[point.dataIndex]?.color ?? palette.primary,
        ),
        callbacks: {
          label(context) {
            const amount = Number(context.parsed.x)
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
      className={cn('relative h-full min-h-48 w-full', className)}
    >
      <Bar data={data} options={options} plugins={[valueLabels]} />
    </div>
  )
}
