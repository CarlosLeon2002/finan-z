import { useMemo } from 'react'
import type { ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { ProjectionPoint } from '../domain/savings'
import { CHART_FONT, useChartPalette, withAlpha } from './chartTheme'
import { createExternalTooltip } from './chartTooltip'
import './register'

interface SavingsProjectionProps {
  points: ProjectionPoint[]
  /** Etiquetas (fechas ya formateadas) en el mismo orden que `points`. */
  labels: string[]
  target: number
  projectionLabel: string
  targetLabel: string
  formatAmount: (value: number) => string
  formatAxis: (value: number) => string
}

/**
 * Gráfica de proyección: histórico real + tramo futuro punteado hasta la meta.
 * El relleno usa un degradado creado sobre el propio canvas, teñido con el
 * acento activo.
 */
export function SavingsProjection({
  points,
  labels,
  target,
  projectionLabel,
  targetLabel,
  formatAmount,
  formatAxis,
}: SavingsProjectionProps) {
  const palette = useChartPalette()

  const firstFutureIndex = points.findIndex((point) => !point.isPast)

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: projectionLabel,
          data: points.map((point) => Math.round(point.amount)),
          borderColor: palette.primary,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: palette.primary,
          pointHoverBorderColor: palette.surface,
          pointHoverBorderWidth: 2,
          backgroundColor(context: {
            chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } }
          }) {
            const { ctx, chartArea } = context.chart
            if (!chartArea) return withAlpha(palette.primary, 0.2)
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, withAlpha(palette.primary, palette.isDark ? 0.42 : 0.32))
            gradient.addColorStop(1, withAlpha(palette.primary, 0))
            return gradient
          },
          segment: {
            // El tramo futuro se dibuja punteado para separarlo de lo real.
            borderDash: (context: { p0DataIndex: number }) =>
              firstFutureIndex >= 0 && context.p0DataIndex >= firstFutureIndex
                ? [6, 6]
                : undefined,
          },
        },
        {
          label: targetLabel,
          data: labels.map(() => Math.round(target)),
          borderColor: palette.success,
          borderWidth: 1.5,
          borderDash: [4, 6],
          pointRadius: 0,
          fill: false,
        },
      ],
    }),
    [labels, points, projectionLabel, target, targetLabel, firstFutureIndex, palette],
  )

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: { duration: 700, easing: 'easeOutQuart' },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: palette.text, maxTicksLimit: 6, maxRotation: 0, font: { family: CHART_FONT } },
        },
        y: {
          beginAtZero: true,
          grid: { color: palette.grid },
          border: { display: false },
          ticks: {
            color: palette.text,
            font: { family: CHART_FONT },
            maxTicksLimit: 5,
            callback: (value) => formatAxis(Number(value)),
          },
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
            pointStyle: 'line',
            boxWidth: 24,
            padding: 16,
            font: { family: CHART_FONT, size: 12 },
          },
        },
        tooltip: {
          external: createExternalTooltip(palette, (point) =>
            point.datasetIndex === 0 ? palette.primary : palette.success,
          ),
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatAmount(Number(context.parsed.y))}`,
          },
        },
      },
    }),
    [palette, formatAxis, formatAmount],
  )

  return <Line data={data} options={options} />
}
