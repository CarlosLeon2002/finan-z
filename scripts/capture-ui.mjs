// Captura la app en varios temas/acentos para revisión visual.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

async function capture(name, { accent, themeMode, route = '#/home', width = 1280, height = 1400 }) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  // Inyecta el estado (idioma elegido + apariencia) antes de cargar.
  await page.evaluateOnNewDocument((a, m) => {
    const record = {
      savedAt: new Date().toISOString(),
      data: {
        version: 1,
        settings: { locale: 'es-419', currency: 'USD', accent: a, themeMode: m },
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
            horizon: { mode: 'calendar', unit: 'months', value: 6 }, contributions: [
              { id: 'a1', date: '2026-09-15', amount: 400 }, { id: 'a2', date: '2026-10-15', amount: 500 },
            ], createdAt: '2026-09-01',
          },
        ],
      },
    }
    localStorage.setItem('finanzas-personales::state', JSON.stringify(record))
  }, accent, themeMode)

  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0' })
  await sleep(700)
  await page.screenshot({ path: `/tmp/opencode/${name}.png`, fullPage: true })
  console.log(`captura: /tmp/opencode/${name}.png`)
  await page.close()
}

await capture('ui-indigo-light', { accent: 'indigo', themeMode: 'light' })
await capture('ui-vrock-light', { accent: 'vrock', themeMode: 'light' })
await capture('ui-vrock-dark', { accent: 'vrock', themeMode: 'dark', route: '#/partition' })
await capture('ui-indigo-settings', { accent: 'indigo', themeMode: 'light', route: '#/settings' })
await capture('ui-mobile-vrock', { accent: 'vrock', themeMode: 'light', width: 390, height: 1200 })

await browser.close()
console.log('listo')
