// Comprueba a 320px que etiquetas no quedan truncadas ni solapadas.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const STATE = {
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent: 'indigo', themeMode: 'light' },
    income: { netAmount: 4200, payFrequency: 'monthly', paydayDate: '2026-10-25', customIntervalDays: 30 },
    categories: [{ id: 'c1', preset: 'housing', label: 'Hogar', emoji: '🏠', color: '#6366f1', amount: 1400 }],
    goals: [],
  },
}

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 320, height: 760, deviceScaleFactor: 1 })
await page.evaluateOnNewDocument((s) => localStorage.setItem('finanzas-personales::state', JSON.stringify(s)), STATE)
await page.goto(`${BASE}#/settings`, { waitUntil: 'networkidle0' })
await sleep(500)

const info = await page.evaluate(() => {
  const groups = [...document.querySelectorAll('[role=group]')].map((g) => ({
    label: g.getAttribute('aria-label'),
    segs: [...g.querySelectorAll('button')].map((s) => {
      const span = s.querySelector('span.truncate') ?? s
      return {
        txt: (s.getAttribute('aria-label') || s.textContent || '').trim().slice(0, 14),
        w: Math.round(s.getBoundingClientRect().width),
        trunc: span.scrollWidth > span.clientWidth + 1,
      }
    }),
  }))
  return { groups, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }
})

console.log(`scrollW=${info.scrollW} clientW=${info.clientW} ${info.scrollW <= info.clientW + 1 ? 'OK' : 'DESBORDE'}`)
for (const g of info.groups) {
  const trunc = g.segs.filter((s) => s.trunc)
  console.log(`[${g.label}] ` + g.segs.map((s) => `${s.txt}:${s.w}px${s.trunc ? '✂' : ''}`).join(' | '))
  if (trunc.length) console.log(`   ⚠ truncadas: ${trunc.map((s) => s.txt).join(', ')}`)
}
await browser.close()
