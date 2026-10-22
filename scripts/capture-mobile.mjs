// Capturas en móvil estrecho para revisión visual de solapamientos.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const SEED = {
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent: 'indigo', themeMode: 'light' },
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
        contributions: [{ id: 'a1', date: '2026-09-15', amount: 400 }],
        createdAt: '2026-09-01',
      },
    ],
  },
}

for (const width of [320, 360]) {
  const page = await browser.newPage()
  await page.setViewport({ width, height: 900 })
  await page.evaluateOnNewDocument((r) => localStorage.setItem('finanzas-personales::state', JSON.stringify(r)), SEED)

  const shots = [
    ['home', '#/home', null],
    ['partition', '#/partition', null],
    ['savings', '#/savings', null],
    ['settings', '#/settings', null],
  ]
  for (const [name, route] of shots) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0' })
    await sleep(500)
    await page.screenshot({ path: `/tmp/opencode/m${width}-${name}.png`, fullPage: true })
  }

  // Diálogo meta (modo calendario: fila duración + segmentado)
  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /crear meta/i.test(b.textContent ?? ''))
    btn?.click()
  })
  await sleep(600)
  await page.screenshot({ path: `/tmp/opencode/m${width}-goalform.png`, fullPage: false })

  // Diálogo detalle meta
  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /ver detalle/i.test(b.textContent ?? ''))
    btn?.click()
  })
  await sleep(600)
  await page.screenshot({ path: `/tmp/opencode/m${width}-goaldetail.png`, fullPage: false })

  await page.close()
}

await browser.close()
console.log('capturas listas en /tmp/opencode/m32*.png y m36*.png')
