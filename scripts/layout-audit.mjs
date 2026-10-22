// Auditoría de layout en pantallas pequeñas: detecta desbordamiento horizontal,
// elementos interactivos solapados y desbordes de texto.
// node scripts/layout-audit.mjs [url]
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const WIDTHS = [320, 360, 390]
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
        contributions: [
          { id: 'a1', date: '2026-09-15', amount: 400 },
          { id: 'a2', date: '2026-10-15', amount: 500 },
        ],
        createdAt: '2026-09-01',
      },
    ],
  },
}

const issues = []
const note = (width, where, kind, detail) => issues.push({ width, where, kind, detail })

async function auditPage(page, width, where) {
  const result = await page.evaluate(() => {
    const out = { overflowX: null, overlaps: [], clipped: [] }
    const doc = document.documentElement
    if (doc.scrollWidth > doc.clientWidth + 1) {
      out.overflowX = { scroll: doc.scrollWidth, client: doc.clientWidth }
    }

    const rectOf = (el) => el.getBoundingClientRect()
    const visible = (el) => {
      const r = rectOf(el)
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'
    }
    const name = (el) =>
      `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/).slice(0, 3).join('.') : ''}"${(el.textContent || '').trim().slice(0, 24)}"`

    // 1) Elementos interactivos solapados (solo si no es ancestro/descendiente)
    const interactives = [...document.querySelectorAll('button, a, input, select, textarea, [role="dialog"] button, [role="dialog"] input')].filter(visible)
    for (let i = 0; i < interactives.length; i++) {
      for (let j = i + 1; j < interactives.length; j++) {
        const a = interactives[i]
        const b = interactives[j]
        if (a.contains(b) || b.contains(a)) continue
        const ra = rectOf(a)
        const rb = rectOf(b)
        const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
        const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
        if (ox > 2 && oy > 2) {
          out.overlaps.push({ a: name(a), b: name(b), ox: Math.round(ox), oy: Math.round(oy) })
        }
      }
    }

    // 2) Texto que desborda su contenedor (clipping horizontal)
    for (const el of document.querySelectorAll('button, p, h1, h2, h3, h4, span, a')) {
      if (!visible(el)) continue
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        const s = getComputedStyle(el)
        // solo importa si el texto no puede mostrarse por completo (sin scroll propio)
        if (s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis') {
          if (s.textOverflow !== 'ellipsis') {
            out.clipped.push({ el: name(el), scroll: el.scrollWidth, client: el.clientWidth })
          }
        }
      }
    }

    // 3) Elementos que sobresalen del viewport a la derecha
    for (const el of document.querySelectorAll('button, input, select, [class*="rounded"]')) {
      if (!visible(el)) continue
      const r = rectOf(el)
      if (r.right > doc.clientWidth + 1 && r.width < doc.clientWidth) {
        out.clipped.push({ el: name(el), right: Math.round(r.right), viewport: doc.clientWidth })
      }
    }
    return out
  })

  if (result.overflowX) {
    note(width, where, 'overflow-x', `scrollW=${result.overflowX.scroll} > clientW=${result.overflowX.client}`)
  }
  for (const o of result.overlaps) note(width, where, 'overlap', `${o.a} ↔ ${o.b} (${o.ox}×${o.oy}px)`)
  for (const c of result.clipped) note(width, where, 'overflow-el', JSON.stringify(c))
}

async function openPage(seed = true) {
  const page = await browser.newPage()
  if (seed) {
    await page.evaluateOnNewDocument((record) => {
      localStorage.setItem('finanzas-personales::state', JSON.stringify(record))
    }, SEED)
  }
  return page
}

for (const width of WIDTHS) {
  const page = await openPage()
  await page.setViewport({ width, height: 800 })

  for (const route of ['#/home', '#/partition', '#/savings', '#/tips', '#/settings']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0' })
    await sleep(400)
    await auditPage(page, width, route)
  }

  // Diálogo: meta (formulario)
  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /crear meta|nueva meta/i.test(b.textContent ?? ''))
    btn?.click()
  })
  await sleep(500)
  await auditPage(page, width, 'dialog:goal-form')
  // click en la sección de duración modo calendario ya visible

  // Diálogo: alta de categoría
  await page.goto(`${BASE}#/partition`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /agregar categoría/i.test(b.textContent ?? ''))
    btn?.click()
  })
  await sleep(500)
  await auditPage(page, width, 'dialog:category')

  // Diálogo: detalle de meta
  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /ver detalle|abrir/i.test(b.textContent ?? ''))
    btn?.click()
  })
  await sleep(500)
  await auditPage(page, width, 'dialog:goal-detail')

  await page.close()
}

await browser.close()

if (issues.length === 0) {
  console.log('OK — sin problemas de layout detectados')
} else {
  console.log(`${issues.length} problema(s):`)
  for (const i of issues) console.log(`  [${i.width}px] ${i.where} · ${i.kind} · ${i.detail}`)
}
process.exit(issues.length ? 1 : 0)
