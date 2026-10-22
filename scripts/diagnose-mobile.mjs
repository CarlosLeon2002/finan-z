// Diagnóstico: captura rutas y diálogos en pantallas muy pequeñas para detectar solapes.
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

// Estado de ejemplo con datos para que los formularios/diálogos tengan contenido.
const STATE = {
  savedAt: new Date().toISOString(),
  data: {
    version: 1,
    settings: { locale: 'es-419', currency: 'USD', accent: 'vrock', themeMode: 'light' },
    income: { netAmount: 4200, payFrequency: 'monthly', paydayDate: '2026-10-25', customIntervalDays: 30 },
    categories: [
      { id: 'c1', preset: 'housing', label: 'Hogar', emoji: '🏠', color: '#6366f1', amount: 1400 },
      { id: 'c2', preset: 'food', label: 'Comida', emoji: '🛒', color: '#f59e0b', amount: 800 },
      { id: 'c3', preset: 'transport', label: 'Transporte', emoji: '🚗', color: '#10b981', amount: 420 },
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

async function newPage(width, height) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 2 })
  await page.evaluateOnNewDocument((s) => {
    localStorage.setItem('finanzas-personales::state', JSON.stringify(s))
  }, STATE)
  return page
}

async function shot(page, name) {
  await sleep(600)
  await page.screenshot({ path: `/tmp/opencode/${name}.png`, fullPage: true })
  console.log(`captura: /tmp/opencode/${name}.png`)
}

// Detección de desborde horizontal (scroll que no debería existir).
async function checkOverflow(page, name) {
  const res = await page.evaluate(() => {
    const doc = document.documentElement
    const scrollW = Math.max(doc.scrollWidth, document.body.scrollWidth)
    const clientW = doc.clientWidth
    const overflowing = scrollW > clientW + 1
    // Elementos más anchos que la ventana
    const wide = []
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width > clientW + 1 && r.width > 0) {
        wide.push(`${el.tagName}.${(el.className && el.className.baseVal !== undefined ? '' : String(el.className)).slice(0, 40)}`)
      }
    }
    return { scrollW, clientW, overflowing, wide: wide.slice(0, 6) }
  })
  console.log(
    `${res.overflowing ? 'DESBORDE' : 'ok     '}  ${name}: scrollW=${res.scrollW} clientW=${res.clientW}` +
      (res.wide.length ? `\n        anchos: ${res.wide.join(' | ')}` : ''),
  )
}

const WIDTHS = [
  { w: 320, h: 700, tag: '320' },
  { w: 360, h: 760, tag: '360' },
]

const ROUTES = ['home', 'partition', 'savings', 'tips', 'settings']

for (const { w, h, tag } of WIDTHS) {
  console.log(`\n=== ${w}px ===`)
  for (const route of ROUTES) {
    const page = await newPage(w, h)
    await page.goto(`${BASE}#/${route}`, { waitUntil: 'networkidle0' })
    await checkOverflow(page, `#${route} @${tag}`)
    await page.close()
  }
}

// Capturas detalladas de los sospechosos a 320px
const detail = await newPage(320, 760)
await detail.goto(`${BASE}#/settings`, { waitUntil: 'networkidle0' })
await shot(detail, 'm320-settings')

// Abrir el formulario de meta (diálogo con muchos campos)
await detail.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
await detail.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /crear meta|nueva meta|new goal/i.test(b.textContent ?? ''))
  btn?.click()
})
await shot(detail, 'm320-goaldialog')
await checkOverflow(detail, 'goalDialog @320')
await detail.close()

// Diálogo de detalle de meta (fila de aporte: monto + fecha + botón)
const detail2 = await newPage(320, 760)
await detail2.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
await detail2.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /viaje a la playa/i.test(b.textContent ?? ''))
  btn?.click()
})
await shot(detail2, 'm320-goaldetail')
await detail2.close()

await browser.close()
console.log('\nlisto')
