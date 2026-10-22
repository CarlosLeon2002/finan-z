// Captura las 4 variantes de la gráfica principal (dona/barras/medidor/apilada)
// en el Panel y en Partición, según la preferencia guardada en Ajustes.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const SEED = (chartStyle) => ({
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent: 'indigo', themeMode: 'light', chartStyle },
    income: { netAmount: 4200, payFrequency: 'monthly', paydayDate: '2026-10-25', customIntervalDays: 30 },
    categories: [
      { id: 'c1', preset: 'housing', label: 'Hogar', emoji: '🏠', color: '#6366f1', amount: 1400 },
      { id: 'c2', preset: 'food', label: 'Comida', emoji: '🛒', color: '#f59e0b', amount: 800 },
      { id: 'c3', preset: 'transport', label: 'Transporte', emoji: '🚗', color: '#10b981', amount: 420 },
      { id: 'c4', preset: 'cards', label: 'Tarjetas', emoji: '💳', color: '#ef4444', amount: 650 },
      { id: 'c5', preset: 'savings', label: 'Ahorro', emoji: '🏦', color: '#8b5cf6', amount: 500 },
    ],
    goals: [
      {
        id: 'g1', title: 'Viaje a la playa', objective: 'travel', targetAmount: 3000,
        initialAmount: 600, startDate: '2026-09-01', methodId: 'm1',
        horizon: { mode: 'calendar', unit: 'months', value: 6 },
        contributions: [
          { id: 'a1', date: '2026-09-15', amount: 400 },
          { id: 'a2', date: '2026-10-15', amount: 500 },
        ],
        createdAt: '2026-09-01',
      },
    ],
  },
})

for (const style of ['donut', 'ranking', 'gauge', 'stacked']) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.evaluateOnNewDocument((r) => localStorage.setItem('finanzas-personales::state', JSON.stringify(r)), SEED(style))

  await page.goto(`${BASE}#/home`, { waitUntil: 'networkidle0' })
  await sleep(700)
  await page.screenshot({ path: `/tmp/opencode/chart-${style}-home.png` })

  await page.goto(`${BASE}#/partition`, { waitUntil: 'networkidle0' })
  await sleep(700)
  await page.screenshot({ path: `/tmp/opencode/chart-${style}-partition.png` })

  await page.close()
}

// Ajustes: sección Visualizaciones con el selector de gráfica.
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.evaluateOnNewDocument((r) => localStorage.setItem('finanzas-personales::state', JSON.stringify(r)), SEED('ranking'))
await page.goto(`${BASE}#/settings`, { waitUntil: 'networkidle0' })
await sleep(500)
await page.evaluate(() => window.scrollTo(0, 520))
await sleep(300)
await page.screenshot({ path: `/tmp/opencode/chart-settings.png` })
await page.close()

await browser.close()
console.log('capturas de gráficas listas')
