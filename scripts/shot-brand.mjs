// Verifica el branding "Finan-Z" en la cabecera y captura el acento V-Rock.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] })

const SEED = (accent) => ({
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent, themeMode: 'light', chartStyle: 'donut' },
    income: { netAmount: 4200, payFrequency: 'monthly', paydayDate: '2026-10-25', customIntervalDays: 30 },
    categories: [
      { id: 'c1', preset: 'housing', label: 'Hogar', emoji: '🏠', color: '#6366f1', amount: 1400 },
      { id: 'c2', preset: 'food', label: 'Comida', emoji: '🛒', color: '#f59e0b', amount: 800 },
    ],
    goals: [],
  },
})

// 1) Header con branding
const p1 = await browser.newPage()
await p1.setViewport({ width: 1280, height: 720 })
await p1.evaluateOnNewDocument((r) => localStorage.setItem('finanzas-personales::state', JSON.stringify(r)), SEED('vrock'))
await p1.goto(`${BASE}#/home`, { waitUntil: 'networkidle0' })
await sleep(700)
const headerText = await p1.evaluate(() => {
  const h = document.querySelector('header')
  return h ? h.innerText.replace(/\s+/g, ' ').trim() : '(sin header)'
})
console.log('HEADER:', headerText)
const cssPrimary = await p1.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
)
console.log('CSS --color-primary (vrock):', cssPrimary)
await p1.screenshot({ path: '/tmp/opencode/brand-vrock.png' })
await p1.close()

await browser.close()
console.log('ok')
