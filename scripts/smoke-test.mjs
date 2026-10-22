// Smoke test visual/funcional con Puppeteer sobre el build de producción.
// node scripts/smoke-test.mjs [url]
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const results = []
const log = (name, ok, extra = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })

const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

try {
  // 1. Onboarding: selector de idioma (primera visita, sin localStorage previo)
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.waitForSelector('button', { timeout: 5000 })
  const gateText = await page.evaluate(() => document.body.innerText)
  log('onboarding: título visible', /Finan-Z/i.test(gateText))
  log('onboarding: aviso de privacidad', /sin nube|no cloud/i.test(gateText))

  // "Comenzar" entra a la app (es-419 viene seleccionado por defecto)
  const started = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /Comenzar|Get started/i.test(b.textContent ?? ''))
    if (!btn) return false
    btn.click()
    return true
  })
  log('onboarding: entrar con "Comenzar"', started)
  await sleep(300)

  // 2. Recorrer las 5 rutas por hash
  const routes = ['home', 'partition', 'savings', 'tips', 'settings']
  for (const route of routes) {
    await page.goto(`${BASE}#/${route}`, { waitUntil: 'networkidle0' })
    await sleep(250)
    const text = await page.evaluate(() => document.body.innerText)
    log(`ruta #/${route}`, text.trim().length > 20, `${text.trim().split('\n').length} líneas`)
  }

  // 3. Registrar ingreso en Partición
  await page.goto(`${BASE}#/partition`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('#net-amount', { timeout: 5000 })
  await page.click('#net-amount', { clickCount: 3 })
  await page.type('#net-amount', '15000')
  await sleep(300)
  const stored = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('finanzas-personales::state')
      return raw ? JSON.parse(raw).data?.income?.netAmount : null
    } catch {
      return null
    }
  })
  log('partición: ingreso persistido en localStorage', stored === 15000, `netAmount=${stored}`)

  // 4. Alta de una meta de ahorro
  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('button', { timeout: 5000 })
  const opened = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /crear meta|nueva meta|new goal|create goal/i.test(b.textContent ?? ''))
    if (!btn) return false
    btn.click()
    return true
  })
  log('savings: abrir formulario de meta', opened)
  await sleep(300)
  const modalOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"], dialog, [data-open]'))
  log('savings: diálogo visible', modalOpen)
  // Cerrar el diálogo si está abierto
  await page.keyboard.press('Escape').catch(() => {})
  await sleep(200)

  // 5. Exportación .txt desde Ajustes
  await page.goto(`${BASE}#/settings`, { waitUntil: 'networkidle0' })
  const hasExport = await page.evaluate(() => /export/i.test(document.body.innerText))
  log('settings: exportación presente', hasExport)

  log('sin errores JS en consola', errors.length === 0, errors.slice(0, 3).join(' | '))

  // Capturas para revisión visual
  await page.goto(`${BASE}#/home`, { waitUntil: 'networkidle0' })
  await sleep(400)
  await page.screenshot({ path: '/tmp/opencode/home.png', fullPage: true })
  await page.goto(`${BASE}#/partition`, { waitUntil: 'networkidle0' })
  await sleep(400)
  await page.screenshot({ path: '/tmp/opencode/partition.png', fullPage: true })
  console.log('capturas: /tmp/opencode/home.png y partition.png')
} catch (err) {
  log('ejecución', false, err.message)
} finally {
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`)
  process.exit(failed ? 1 : 0)
}
