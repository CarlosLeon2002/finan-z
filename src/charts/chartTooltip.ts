import type { Chart, Plugin } from 'chart.js'
import type { ChartPalette } from './chartTheme'

/**
 * Tooltip flotante en HTML (en lugar del que dibuja Chart.js sobre el canvas).
 * Así se puede estilizar con desenfoque, sombra y tipografía del tema, y se
 * mantiene nítido en pantallas de alta densidad.
 *
 * El elemento vive en <body> con posición fija: nunca lo recorta una tarjeta
 * con overflow oculto y sigue al puntero al hacer scroll.
 */

const HOSTS = new WeakMap<Chart, HTMLDivElement>()

/** Plugin global que limpia el tooltip cuando la gráfica se desmonta. */
export const chartTooltipCleanup: Plugin = {
  id: 'chartTooltipCleanup',
  beforeDestroy(chart) {
    HOSTS.get(chart)?.remove()
    HOSTS.delete(chart)
  },
}

/**
 * Con `external` activo, Chart.js seguiría dibujando su tooltip de canvas.
 * Este plugin cancela ese dibujo para dejar solo el flotante HTML.
 */
export const chartTooltipSuppressCanvas: Plugin = {
  id: 'chartTooltipSuppressCanvas',
  beforeTooltipDraw(chart) {
    const tooltipOptions = chart.options.plugins?.tooltip
    if (tooltipOptions?.external) return false
    return undefined
  },
}

function hostFor(chart: Chart): HTMLDivElement {
  const existing = HOSTS.get(chart)
  if (existing?.isConnected) return existing

  const host = document.createElement('div')
  host.className = 'chart-tooltip'
  host.setAttribute('aria-hidden', 'true')
  document.body.appendChild(host)
  HOSTS.set(chart, host)
  return host
}

/** Forma mínima que se necesita del modelo de tooltip de Chart.js. */
interface TooltipLike {
  opacity: number
  caretX: number
  caretY: number
  title: string[]
  body: { before: string[]; lines: string[]; after: string[] }[]
  dataPoints: { dataIndex: number; datasetIndex: number }[]
}

export interface TooltipPoint {
  dataIndex: number
  datasetIndex: number
}

/**
 * Crea el handler `external` de Chart.js. `resolveColor` permite pintar el
 * punto de cada fila con el color real de la categoría (los degradados de
 * Chart.js no son un string, por eso se resuelve desde los datos).
 */
export function createExternalTooltip(
  palette: ChartPalette,
  resolveColor?: (point: TooltipPoint) => string,
) {
  return ({ chart, tooltip }: { chart: Chart; tooltip: TooltipLike }) => {
    const host = hostFor(chart)

    if (tooltip.opacity === 0 || tooltip.body.length === 0) {
      host.classList.remove('is-visible')
      return
    }

    const nodes: HTMLElement[] = []

    const title = tooltip.title?.[0]
    if (title) {
      const heading = document.createElement('p')
      heading.className = 'chart-tooltip__title'
      heading.textContent = title
      nodes.push(heading)
    }

    tooltip.body.forEach((item, index) => {
      const point = tooltip.dataPoints[index]
      const color =
        point && resolveColor
          ? resolveColor({ dataIndex: point.dataIndex, datasetIndex: point.datasetIndex })
          : palette.primary

      const row = document.createElement('div')
      row.className = 'chart-tooltip__row'

      const dot = document.createElement('span')
      dot.className = 'chart-tooltip__dot'
      dot.style.backgroundColor = color

      const value = document.createElement('span')
      value.className = 'chart-tooltip__value'
      value.textContent = item.lines.join(' ')

      row.append(dot, value)
      nodes.push(row)
    })

    host.replaceChildren(...nodes)
    host.classList.add('is-visible')

    const canvasRect = chart.canvas.getBoundingClientRect()
    const ownRect = host.getBoundingClientRect()
    const padding = 10
    const gap = 16

    const half = ownRect.width / 2
    const anchorX = canvasRect.left + tooltip.caretX
    const anchorY = canvasRect.top + tooltip.caretY
    const left = Math.min(
      Math.max(anchorX, half + padding),
      window.innerWidth - half - padding,
    )

    // Si no cabe arriba del punto, se muestra debajo (con la flecha arriba).
    const below = anchorY - ownRect.height - gap < padding

    host.style.left = `${left}px`
    host.style.top = `${below ? anchorY + gap : anchorY - gap}px`
    host.classList.toggle('is-below', below)
  }
}
