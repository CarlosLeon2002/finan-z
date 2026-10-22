import { Chart, Filler, Legend, LineElement, PointElement, Tooltip } from 'chart.js'
import { ArcElement, BarElement, BarController, CategoryScale, LinearScale, LineController } from 'chart.js'
import { chartTooltipCleanup, chartTooltipSuppressCanvas } from './chartTooltip'

/**
 * Registro único de Chart.js: solo se pide lo que la app usa (torta + líneas),
 * así el bundle se mantiene liviano. Se importa una sola vez desde los gráficos.
 */
Chart.register(
  ArcElement,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  chartTooltipCleanup,
  chartTooltipSuppressCanvas,
)

Chart.defaults.font.family = "'Inter', ui-sans-serif, system-ui, sans-serif"
Chart.defaults.font.size = 12
// `set` fusiona con los defaults: reemplazar el objeto entero borraría los
// interpoladores (type/fn/from/to) y rompería las animaciones de color.
Chart.defaults.set('animation', { duration: 750, easing: 'easeOutQuart' })
