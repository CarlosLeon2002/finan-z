import type { Chart } from 'chart.js'
import { accentColors } from '../theme/accents'
import { useTheme } from '../theme/theme'

/**
 * Chart.js pinta sobre <canvas>, así que no puede leer clases de Tailwind.
 * Este módulo traduce el tema activo (claro/oscuro + acento elegido) a colores
 * concretos para las gráficas. El acento se toma de la misma paleta que usa la
 * interfaz, de modo que ambos siempre coinciden.
 */

export interface ChartPalette {
  /** Color de marca del acento activo (líneas, sectores, rellenos). */
  primary: string
  primaryStrong: string
  primarySoft: string
  /** Cifras grandes y valores destacados. */
  strong: string
  /** Texto de ejes y leyendas. */
  text: string
  grid: string
  /** Fondo neutro (anillo vacío, pista de progreso). */
  track: string
  surface: string
  border: string
  /** Verde de referencia para la línea de objetivo. */
  success: string
  /** `true` cuando el tema activo es oscuro (ajusta los degradados). */
  isDark: boolean
}

const LIGHT = {
  strong: '#171a2b',
  text: '#5f657d',
  grid: 'rgba(95, 101, 125, 0.14)',
  track: '#e7e9f0',
  surface: '#ffffff',
  border: '#e5e8ef',
  success: '#0e9167',
} as const

const DARK = {
  strong: '#e8ecf6',
  text: '#98a2c0',
  grid: 'rgba(152, 162, 192, 0.16)',
  track: '#1e2636',
  surface: '#10141f',
  border: '#262e45',
  success: '#2fbf8e',
} as const

export function useChartPalette(): ChartPalette {
  const { accent, isDark } = useTheme()
  const colors = accentColors(accent, isDark)
  const base = isDark ? DARK : LIGHT
  return {
    primary: colors.primary,
    primaryStrong: colors.strong,
    primarySoft: colors.soft,
    isDark,
    ...base,
  }
}

export const CHART_FONT =
  "'Inter', ui-sans-serif, system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"

/* ---------------------------------------------------------------------------
   Utilidades de color
   Las gráficas reciben colores hex de las categorías; para los degradados hay
   que aclarar/oscurecer sobre la marcha sin depender de una librería extra.
--------------------------------------------------------------------------- */

interface Rgb {
  r: number
  g: number
  b: number
}

function parseHex(hex: string): Rgb | null {
  const raw = hex.trim().replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((channel) => channel + channel)
          .join('')
      : raw
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

/** Mezcla `hex` con `target` (ambos hex) en la proporción `amount` (0..1). */
export function mixColor(hex: string, target: string, amount: number): string {
  const from = parseHex(hex)
  const to = parseHex(target)
  if (!from || !to) return hex
  const weight = Math.min(1, Math.max(0, amount))
  return toHex({
    r: from.r + (to.r - from.r) * weight,
    g: from.g + (to.g - from.g) * weight,
    b: from.b + (to.b - from.b) * weight,
  })
}

export function lightenColor(hex: string, amount: number): string {
  return mixColor(hex, '#ffffff', amount)
}

export function darkenColor(hex: string, amount: number): string {
  return mixColor(hex, '#000000', amount)
}

/** Convierte un hex a `rgba(...)` para rellenos suaves. */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export type GradientAxis = 'diagonal' | 'horizontal' | 'vertical'

interface GradientOptions {
  axis?: GradientAxis
  /** Cuánto se aclara el primer extremo (0..1). */
  light?: number
  /** Cuánto se oscurece el último extremo (0..1). */
  dark?: number
}

/**
 * Degradado de tres paradas sobre el área de la gráfica. Es la base visual de
 * sectores, barras y arcos: mismo color de la categoría, con un brillo sutil
 * arriba/izquierda que se apaga abajo/derecha.
 */
export function chartGradient(
  chart: Chart,
  color: string,
  { axis = 'diagonal', light = 0.22, dark = 0.18 }: GradientOptions = {},
): CanvasGradient | string {
  const { ctx, chartArea } = chart
  if (!chartArea) return color

  const { left, right, top, bottom } = chartArea
  const centerX = (left + right) / 2
  const centerY = (top + bottom) / 2

  const [x0, y0, x1, y1] =
    axis === 'horizontal'
      ? [left, centerY, right, centerY]
      : axis === 'vertical'
        ? [centerX, top, centerX, bottom]
        : [left, top, right, bottom]

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  gradient.addColorStop(0, lightenColor(color, light))
  gradient.addColorStop(0.55, color)
  gradient.addColorStop(1, darkenColor(color, dark))
  return gradient
}
