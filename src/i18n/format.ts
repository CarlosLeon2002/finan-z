import type { CurrencyCode, Locale } from '../types'

/**
 * Formateo con la API internacional de Intl: sin dependencias y con reglas
 * locales correctas (separador de miles, símbolo, fechas...).
 */

const numberCache = new Map<string, Intl.NumberFormat>()

function numberFormatter(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  const cached = numberCache.get(key)
  if (cached) return cached

  const formatter = new Intl.NumberFormat(locale, options)
  numberCache.set(key, formatter)
  return formatter
}

export function formatMoney(
  value: number,
  locale: Locale,
  currency: CurrencyCode,
  fractionDigits = 2,
): string {
  const safeValue = Number.isFinite(value) ? value : 0
  return numberFormatter(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeValue)
}

/** `fraction` llega entre 0 y 1 (0.357 → 36 %). */
export function formatPercent(fraction: number, locale: Locale): string {
  const safeValue = Number.isFinite(fraction) ? fraction : 0
  return numberFormatter(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(safeValue)
}

export function formatNumber(value: number, locale: Locale): string {
  return numberFormatter(locale, { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  )
}

export function formatDate(value: string | Date, locale: Locale): string {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    date,
  )
}

export function formatDateTime(value: string | Date, locale: Locale): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Duración legible a partir de días: "18 días", "6 meses", "1.5 años". */
export function formatDuration(days: number, locale: Locale): string {
  const unit = (value: number, unitName: Intl.NumberFormatOptions['unit']) =>
    numberFormatter(locale, { style: 'unit', unit: unitName, unitDisplay: 'long' }).format(value)

  const safeDays = Math.max(0, Math.round(days))
  if (safeDays < 90) return unit(safeDays, 'day')
  if (safeDays < 730) return unit(Math.round(safeDays / 30.4375), 'month')

  const years = safeDays / 365.25
  return unit(Number.isInteger(years) ? years : Math.round(years * 10) / 10, 'year')
}

/** Nombre completo de la moneda en el idioma activo (Intl.DisplayNames). */
export function formatCurrencyName(code: CurrencyCode, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? code
  } catch {
    return code
  }
}

/**
 * Días de la semana en orden domingo (0) … sábado (6),
 * que es el orden que usa `paydayWeekday`.
 */
export function weekdayNames(locale: Locale): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  // 2024-01-07 fue domingo, así que el índice coincide con `getDay()`.
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 7 + index)))
}
