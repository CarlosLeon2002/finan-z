// Captura puntual: formulario de meta y su bloque de duración en móvil estrecho.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] })

const SEED = {
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent: 'indigo', themeMode: 'light' },
    income: { netAmount: 4200, payFrequency: 'monthly', paydayDate: '2026-10-25', customIntervalDays: 30 },
    categories: [{ id: 'c1', preset: 'housing', label: 'Hogar', emoji: '🏠', color: '#6366f1', amount: 1400 }],
    goals: [],
  },
}

for (const width of [320, 360]) {
  const page = await browser.newPage()
  await page.setViewport({ width, height: 900 })
  await page.evaluateOnNewDocument((r) => localStorage.setItem('finanzas-personales::state', JSON.stringify(r)), SEED)

  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /Nueva meta/i.test(b.textContent ?? ''))
    btn?.click()
  })
  await sleep(600)
  await page.screenshot({ path: `/tmp/opencode/m${width}-goalform.png` })

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"] .overflow-y-auto')
    if (d) d.scrollTop = 560
  })
  await sleep(400)
  await page.screenshot({ path: `/tmp/opencode/m${width}-goalduration.png` })

  await page.close()
}

await browser.close()
console.log('ok')
