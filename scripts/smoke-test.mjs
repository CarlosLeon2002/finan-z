// Smoke test visual/funcional con Puppeteer sobre el build de producción.
// node scripts/smoke-test.mjs [url]
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'

const BASE = process.argv[2] ?? 'http://localhost:4173/'
const DOWNLOAD_DIR = '/tmp/opencode/finan-z-smoke-downloads'
const results = []
const log = (name, ok, extra = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const clickButton = (page, pattern) =>
  page.evaluate((source) => {
    const regex = new RegExp(source, 'i')
    const button = [...document.querySelectorAll('button')].find((item) =>
      regex.test(item.textContent ?? ''),
    )
    if (!button) return false
    button.click()
    return true
  }, pattern.source)

const waitForDownload = async (previous) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const files = fs
      .readdirSync(DOWNLOAD_DIR)
      .filter((name) => name.endsWith('.txt') && !previous.has(name))
    if (files.length > 0) return path.join(DOWNLOAD_DIR, files[0])
    await sleep(200)
  }
  throw new Error('la descarga del respaldo no apareció')
}

fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true })
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })

const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
const cdp = await page.createCDPSession()
await cdp.send('Page.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: DOWNLOAD_DIR,
})

const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

try {
  // 1. Primera visita: idioma, introducción y salida rápida.
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.waitForSelector('button', { timeout: 5000 })
  const gateText = await page.evaluate(() => document.body.innerText)
  log('primera visita: selector de idioma visible', /Finan-Z/i.test(gateText))
  log('primera visita: aviso de privacidad', /sin nube|no cloud/i.test(gateText))

  log('idioma: entrar con "Comenzar"', await clickButton(page, /Comenzar|Get started/))
  await page.waitForFunction(
    () => /Todo tu dinero|All your money/i.test(document.body.innerText),
    { timeout: 5000 },
  )
  const introText = await page.evaluate(() => document.body.innerText)
  log('onboarding: introducción visible', /Todo tu dinero|All your money/i.test(introText))
  log('onboarding: opción de saltar', /Saltar|Skip/i.test(introText))

  log('onboarding: saltar en el primer paso', await clickButton(page, /^Saltar$|^Skip$/))
  await sleep(400)
  const homeText = await page.evaluate(() => document.body.innerText)
  log('panel: saludo de primera visita', /Bienvenido a Finan-Z|Welcome to Finan-Z/i.test(homeText))
  log('panel: no dice "de nuevo"', !/de nuevo|again/i.test(homeText))

  const onboardingDone = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('finanzas-personales::state')
      return Boolean(JSON.parse(raw).data?.settings?.onboardingCompletedAt)
    } catch {
      return false
    }
  })
  log('onboarding: finalización persistida', onboardingDone)

  // 2. Recorrer las 5 rutas por hash.
  const routes = ['home', 'partition', 'savings', 'tips', 'settings']
  for (const route of routes) {
    await page.goto(`${BASE}#/${route}`, { waitUntil: 'networkidle0' })
    await sleep(250)
    const text = await page.evaluate(() => document.body.innerText)
    log(`ruta #/${route}`, text.trim().length > 20, `${text.trim().split('\n').length} líneas`)
  }

  // 3. Copy compacto del consejo diario.
  await page.goto(`${BASE}#/tips`, { waitUntil: 'networkidle0' })
  await sleep(300)
  const tipsText = await page.evaluate(() => document.body.innerText)
  log('tips: título simple', /Consejo del día|Tip of the day/i.test(tipsText))
  log(
    'tips: sin copy redundante',
    !/1 al día|se renueva cada día|ideas en rotación|1 per day|renews daily|ideas in rotation/i.test(
      tipsText,
    ),
  )
  log('tips: solo cuenta atrás', /\d+\s?h\s?\d+\s?min/.test(tipsText))

  // 4. Ingreso fijo y persistencia.
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
  log('partición: ingreso fijo persistido', stored === 15000, `netAmount=${stored}`)

  // 5. Modo variable: cada mes conserva su propio ingreso.
  log(
    'partición: cambiar a modo variable',
    await clickButton(page, /^Ingreso variable$|^Variable income$/),
  )
  await page.waitForSelector('#month-income', { timeout: 5000 })
  const firstMonth = await page.evaluate(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('finanzas-personales::state'))
      return { budgets: raw.data.budgets, activeMonth: raw.data.settings.activeMonth }
    } catch {
      return null
    }
  })
  log('variable: primer mes creado desde el fijo', firstMonth?.budgets?.length === 1)
  log('variable: primer mes hereda el ingreso', firstMonth?.budgets?.[0]?.income === 15000)

  await page.$eval('[aria-label="Mes siguiente"]', (button) => button.click())
  await sleep(250)
  log('variable: crear un mes nuevo', await clickButton(page, /Crear presupuesto/i))
  await sleep(350)
  const twoMonths = await page.evaluate(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('finanzas-personales::state'))
      const active = raw.data.budgets.find((item) => item.id === raw.data.settings.activeMonth)
      const first = [...raw.data.budgets].sort((a, b) => (a.id < b.id ? -1 : 1))[0]
      return {
        count: raw.data.budgets.length,
        activeIncome: active?.income,
        firstIncome: first?.income,
      }
    } catch {
      return null
    }
  })
  log('variable: dos presupuestos independientes', twoMonths?.count === 2)
  log('variable: el mes nuevo nace en cero', twoMonths?.activeIncome === 0)
  log('variable: el mes anterior no cambia', twoMonths?.firstIncome === 15000)

  // 6. Alta de una meta de ahorro.
  await page.goto(`${BASE}#/savings`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('button', { timeout: 5000 })
  const opened = await clickButton(page, /crear meta|nueva meta|new goal|create goal/)
  log('metas: abrir formulario', opened)
  await sleep(300)
  const modalOpen = await page.evaluate(
    () => !!document.querySelector('[role="dialog"], dialog, [data-open]'),
  )
  log('metas: diálogo visible', modalOpen)
  await page.keyboard.press('Escape').catch(() => {})
  await sleep(200)

  // 7. Exportación firmada y validación de importación.
  await page.goto(`${BASE}#/settings`, { waitUntil: 'networkidle0' })
  const hasExport = await page.evaluate(() => /export/i.test(document.body.innerText))
  log('ajustes: exportación presente', hasExport)

  const before = new Set(fs.readdirSync(DOWNLOAD_DIR))
  log(
    'ajustes: descargar respaldo .txt',
    await clickButton(page, /Descargar respaldo|Download .txt backup/),
  )
  const downloaded = await waitForDownload(before)
  const backup = fs.readFileSync(downloaded, 'utf8')
  log('respaldo: cabecera firmada', backup.includes('# FINAN-Z:BACKUP:1'))
  log('respaldo: checksum SHA-256', /# CHECKSUM:sha256:[0-9a-f]{64}/.test(backup))
  log('respaldo: reporte legible', backup.includes('Finan-Z'))

  const fileInput = await page.$('input[type="file"]')
  log('ajustes: campo de importación presente', Boolean(fileInput))
  await fileInput.uploadFile(downloaded)
  await page.waitForFunction(
    () => /Revisa el respaldo|Review the backup/i.test(document.body.innerText),
    { timeout: 5000 },
  )
  const previewText = await page.evaluate(() => document.body.innerText)
  log('importación: vista previa válida', /Firma de integridad verificada|integrity signature verified/i.test(previewText))
  log('importación: muestra contenido', /2 meses|2 months/i.test(previewText))
  log(
    'importación: restaurar respaldo',
    await clickButton(page, /Restaurar respaldo|Restore backup/),
  )
  await page.waitForFunction(
    () => /Respaldo restaurado|Backup restored/i.test(document.body.innerText),
    { timeout: 5000 },
  )
  const restored = await page.evaluate(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('finanzas-personales::state'))
      return {
        budgets: raw.data.budgets.length,
        income: raw.data.income.netAmount,
      }
    } catch {
      return null
    }
  })
  log(
    'importación: datos restaurados',
    restored?.budgets === 2 && restored?.income === 15000,
    `budgets=${restored?.budgets}, income=${restored?.income}`,
  )

  const tampered = path.join(DOWNLOAD_DIR, 'tampered.txt')
  fs.writeFileSync(tampered, backup.replace('\n# PAYLOAD-END', ' \n# PAYLOAD-END'))
  const tamperedInput = await page.$('input[type="file"]')
  await tamperedInput.uploadFile(tampered)
  await page.waitForFunction(
    () => /No se pudo importar|Could not import/i.test(document.body.innerText),
    { timeout: 5000 },
  )
  const errorText = await page.evaluate(() => document.body.innerText)
  log('importación: rechaza archivo alterado', /firma|checksum|íntegr|integrity/i.test(errorText))
  await clickButton(page, /^Cerrar$|^Close$/)

  // 8. Regresión: los títulos de alerta deben interpolar el nombre de la meta.
  const alertContext = await browser.createBrowserContext()
  const alertPage = await alertContext.newPage()
  await alertPage.setViewport({ width: 1280, height: 900 })
  await alertPage.goto(BASE, { waitUntil: 'networkidle0' })
  await alertPage.evaluate(() => {
    const now = new Date().toISOString()
    localStorage.setItem(
      'finanzas-personales::state',
      JSON.stringify({
        savedAt: now,
        data: {
          version: 1,
          settings: {
            locale: 'es-419',
            currency: 'UYU',
            accent: 'indigo',
            themeMode: 'light',
            chartStyle: 'donut',
            onboardingCompletedAt: now,
            budgetMode: 'fixed',
            activeMonth: null,
          },
          income: {
            netAmount: 1000,
            payFrequency: 'monthly',
            paydayDate: '2026-10-25',
            customIntervalDays: 30,
          },
          categories: [
            {
              id: 'c1',
              preset: 'housing',
              label: 'Hogar',
              emoji: '🏠',
              color: '#6366f1',
              amount: 1000,
            },
          ],
          goals: [
            {
              id: 'g1',
              title: 'Viaje a la playa',
              objective: 'travel',
              targetAmount: 6000,
              initialAmount: 0,
              startDate: '2026-10-01',
              methodId: 'm1',
              horizon: { mode: 'calendar', unit: 'months', value: 6 },
              contributions: [],
              createdAt: '2026-10-01',
            },
          ],
          budgets: [],
        },
      }),
    )
  })
  await alertPage.reload({ waitUntil: 'networkidle0' })
  await alertPage.goto(`${BASE}#/home`, { waitUntil: 'networkidle0' })
  await sleep(400)
  const alertText = await alertPage.evaluate(() => document.body.innerText)
  log(
    'alertas: título con nombre de meta',
    /Viaje a la playa/.test(alertText) && !/\{title\}/.test(alertText),
  )
  await alertContext.close()

  log('sin errores JS en consola', errors.length === 0, errors.slice(0, 3).join(' | '))

  // Capturas para revisión visual.
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
