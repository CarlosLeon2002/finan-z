import type { AppState, CurrencyCode } from '../types'
import { createCategory, createDefaultIncome, DEFAULT_CATEGORY_PRESETS } from './partition'

/** Región del navegador → moneda más usada (evita elegir mal a mano). */
const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: 'USD',
  MX: 'MXN',
  CO: 'COP',
  AR: 'ARS',
  CL: 'CLP',
  PE: 'PEN',
  UY: 'UYU',
  BO: 'BOB',
  DO: 'DOP',
  GT: 'GTQ',
  HN: 'HNL',
  NI: 'NIO',
  PA: 'PAB',
  CR: 'CRC',
  BR: 'BRL',
  ES: 'EUR',
  PT: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
}

/** Moneda sugerida según la configuración regional del navegador. */
export function detectCurrency(): CurrencyCode {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region
    if (region) return REGION_CURRENCY[region] ?? 'USD'
  } catch {
    // Navegadores sin soporte de Intl.Locale: moneda neutra.
  }
  return 'USD'
}

/**
 * Estado inicial: sin idioma elegido (se muestra la pantalla de bienvenida),
 * ingreso en 0 y las categorías de gasto más comunes listas para editar.
 */
export function createDefaultState(): AppState {
  return {
    version: 1,
    settings: {
      locale: null,
      currency: detectCurrency(),
      accent: 'indigo',
      themeMode: 'auto',
      chartStyle: 'donut',
    },
    income: createDefaultIncome(),
    categories: DEFAULT_CATEGORY_PRESETS.map((preset) => createCategory(preset)),
    goals: [],
  }
}
