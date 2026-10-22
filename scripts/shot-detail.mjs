// Captura el detalle de meta con las nuevas barras de aportes mensuales.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] })

const SEED = {
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent: 'indigo', themeMode: 'light', chartStyle: 'donut' },
    income: { netAmount: 4200, payFrequency: 'monthly', paydayDate: '2026-10-25', customIntervalDays: 30 },
    categories: [{ id: 'c1', preset: 'housing', label: 'Hogar', emoji: '🏠', color: '#6366f1', amount: 1400 }],
    goals: [
      {
        id: 'g1',
        title: 'Viaje a la playa',
        objective: 'travel',
        targetAmount: 3000,
        initialAmount: 600,
        startDate: '2026-09-01',
        methodId: 'm1',
        horizon: { mode: 'calendar', unit: 'months', value: 6 },
        contributions: [
          { id: 'a1', date: '2026-07-15', amount: 300 },
          { id: 'a2', date: '2026-08-15', amount: 450 },
          { id: 'a3', date: '2026-09-15', amount: 400 },
          { id: 'a4', date: '2026-10-15', amount: 500 },
        ],
        createdAt: '2026-09-01',
      },
    ],
  },
}

const page = await browser.newPage()
await page.setViewport({ width: 960, height: 1000 })
await page.evaluateOnNewDocument((r) => localStorage.setItem('finanzas-personales::state', JSON.stringify(r)), SEED)

await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /Ver detalle/i.test(b.textContent ?? ''))
  btn?.click()
})
await sleep(900)
await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"] .overflow-y-auto')
  if (d) d.scrollTop = 640
})
await sleep(500)
await page.screenshot({ path: '/tmp/opencode/detail-contrib.png' })

await browser.close()
console.log('ok')
