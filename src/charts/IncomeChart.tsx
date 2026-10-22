import type { ChartStyle } from '../types'
import { AllocationDoughnut, type DoughnutSlice } from './AllocationDoughnut'

export type { DoughnutSlice }
export type { RankRow } from './CategoryRanking'
import { AllocationGauge } from './AllocationGauge'
import { CategoryRanking, type RankRow } from './CategoryRanking'
import { StackedBudgetBar } from './StackedBudgetBar'

/** Etiquetas cortas que comparten las variantes de la gráfica principal. */
export interface IncomeChartLabels {
  emptyLabel: string
  centerLabel: string
  /** Descripción del anillo en el medidor. */
  gaugeOf: string
  availableLabel: string
}

interface IncomeChartProps {
  style: ChartStyle
  slices: DoughnutSlice[]
  income: number
  assigned: number
  available: number
  centerValue: string
  labels: IncomeChartLabels
  ariaSummary: string
  formatAmount: (value: number, digits?: number) => string
  /** Fracción (0..1) ya formateada según el idioma activo. */
  formatPercent: (fraction: number) => string
  onSelect?: (id: string) => void
  selectedId?: string | null
  className?: string
}

/**
 * Punto de entrada de la gráfica principal de distribución.
 * Renderiza la variante elegida por el usuario en Ajustes (`chartStyle`),
 * manteniendo la misma paleta y el mismo comportamiento interactivo en todas.
 *
 * Cada variante calcula su propia base de porcentaje (dona/ranking sobre lo
 * asignado; apilada sobre el ingreso) a partir del `formatPercent` común.
 */
export function IncomeChart({
  style,
  slices,
  income,
  assigned,
  available,
  centerValue,
  labels,
  ariaSummary,
  formatAmount,
  formatPercent,
  onSelect,
  selectedId,
  className,
}: IncomeChartProps) {
  const shareOfAssigned = (amount: number) =>
    formatPercent(assigned > 0 ? amount / assigned : 0)
  const shareOfIncome = (amount: number) => formatPercent(income > 0 ? amount / income : 0)

  if (style === 'ranking') {
    const rows: RankRow[] = slices.map((slice) => ({
      id: slice.id,
      label: slice.label,
      emoji: '•',
      amount: slice.amount,
      color: slice.color,
    }))
    return (
      <CategoryRanking
        rows={rows}
        emptyLabel={labels.emptyLabel}
        ariaSummary={ariaSummary}
        formatAmount={(value) => formatAmount(value)}
        formatShare={shareOfAssigned}
        onSelect={onSelect}
        selectedId={selectedId}
        className={className}
      />
    )
  }

  if (style === 'gauge') {
    return (
      <AllocationGauge
        assigned={assigned}
        income={income}
        centerValue={centerValue}
        centerLabel={labels.gaugeOf}
        emptyLabel={labels.emptyLabel}
        ariaSummary={ariaSummary}
        className={className}
      />
    )
  }

  if (style === 'stacked') {
    return (
      <StackedBudgetBar
        segments={slices}
        available={available}
        income={income}
        emptyLabel={labels.emptyLabel}
        availableLabel={labels.availableLabel}
        ariaSummary={ariaSummary}
        formatAmount={(value) => formatAmount(value)}
        formatShare={shareOfIncome}
        onSelect={onSelect}
        selectedId={selectedId}
        className={className}
      />
    )
  }

  return (
    <AllocationDoughnut
      slices={slices}
      total={assigned}
      centerValue={centerValue}
      centerLabel={labels.centerLabel}
      emptyLabel={labels.emptyLabel}
      ariaSummary={ariaSummary}
      formatAmount={(value) => formatAmount(value)}
      formatShare={shareOfAssigned}
      onSelect={onSelect}
      selectedId={selectedId}
      className={className}
    />
  )
}
