import { useMemo } from 'react'
import type { ChartOptions, ScriptableContext } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { cn } from '../lib/cn'
import { CHART_FONT, chartGradient, useChartPalette } from './chartTheme'
import { createExternalTooltip } from './chartTooltip'
import './register'

export interface StackSegment {
  id: string
  label: string
  amount: number
  color: string
}

interface StackedBudgetBarProps {
  segments: StackSegment[]
  /** Porción no asignada del ingreso (se muestra con la pista neutra). */
  available: number
  income: number
  emptyLabel: string
  availableLabel: string
  ariaSummary: string
  formatAmount: (value: number) => string
  formatShare: (amount: number) => string
  onSelect?: (id: string) => void
  selectedId?: string | null
  className?: string
}

/**
 * Barra apilada horizontal de un solo eje: divide el ingreso neto de izquierda
 * a derecha entre las categorías asignadas y lo que queda disponible.
 * Solo los extremos van redondeados (capuchones); cada tramo lleva su color
 * con un degradado sutil y tooltip flotante por segmento.
 */
export function StackedBudgetBar({
  segments,
  available,
  income,
  emptyLabel,
  availableLabel,
  ariaSummary,
  formatAmount,
  formatShare,
  onSelect,
  selectedId,
  className,
}: StackedBudgetBarProps) {
  const palette = useChartPalette()

  const used = segments.reduce((sum, segment) => sum + Math.max(0, segment.amount), 0)
  const hasData = income > 0 && (segments.length > 0 || available !== 0)

  const data = useMemo(() => {
    const positive = segments.filter((segment) => segment.amount > 0)
    const order: { label: string; value: number; color: string; id: string | null }[] = [
      ...positive.map((segment) => ({
        label: segment.label,
        value: segment.amount,
        color: selectedId && segment.id === selectedId ? palette.primaryStrong : segment.color,
        id: segment.id,
      })),
    ]
    if (available > 0) {
      order.push({ label: availableLabel, value: available, color: palette.track, id: null })
    }

    const lastIndex = order.length - 1
    return {
      order,
      labels: [''],
      datasets: order.map((item, index) => ({
        label: item.label,
        data: [item.value],
        backgroundColor: (context: ScriptableContext<'bar'>) =>
          chartGradient(context.chart, item.color, {
            axis: 'vertical',
            light: palette.isDark ? 0.18 : 0.14,
            dark: palette.isDark ? 0.2 : 0.12,
          }),
        // Redondeo solo en los capuchones exterior izquierdo y derecho.
        borderRadius:
          order.length === 1
            ? 11
            : index === 0
              ? { topLeft: 11, bottomLeft: 11 }
              : index === lastIndex
                ? { topRight: 11, bottomRight: 11 }
                : 0,
        borderSkipped: false,
        stack: 'budget',
        maxBarThickness: 58,
      })),
    }
  }, [segments, available, availableLabel, selectedId, palette])

  if (!hasData) {
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

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 850, easing: 'easeOutQuart' },
    layout: { padding: { top: 4, bottom: 4, left: 2, right: 2 } },
    onClick: (_event, elements) => {
      const element = elements[0]
      if (!element || !onSelect) return
      const positive = segments.filter((segment) => segment.amount > 0)
      const segment = positive[element.datasetIndex]
      if (segment) onSelect(segment.id)
    },
    scales: {
      x: {
        stacked: true,
        display: false,
        max: Math.max(1, used + Math.max(0, available)),
      },
      y: {
        stacked: true,
        display: false,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'start',
        labels: {
          color: palette.text,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 14,
          font: { family: CHART_FONT, size: 12 },
        },
      },
      tooltip: {
        external: createExternalTooltip(palette, (point) =>
          data.order[point.datasetIndex]?.color ?? palette.primary,
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
      className={cn('relative h-full min-h-32 w-full', className)}
    >
      <Bar data={data} options={options} />
    </div>
  )
}
