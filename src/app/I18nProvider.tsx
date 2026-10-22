import { useEffect, useMemo, type ReactNode } from 'react'
import { useAppState } from './state'
import { I18nContext, type I18nValue } from './i18n'
import { enUS } from '../i18n/en-US'
import { es419 } from '../i18n/es-419'
import {
  formatCurrencyName,
  formatDate,
  formatDateTime,
  formatDuration,
  formatMoney,
  formatNumber,
  formatPercent,
  weekdayNames,
} from '../i18n/format'
import type { Dict, TFunction } from '../i18n/types'
import type { Locale } from '../types'

const DICTS: Record<Locale, Dict> = {
  'es-419': es419,
  'en-US': enUS,
}

function readPath(dict: Dict, path: string): string | undefined {
  let current: unknown = dict
  for (const segment of path.split('.')) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  )
}

/**
 * Traducciones + formateo según `settings` del estado global.
 * Debe montarse dentro de `<AppStateProvider>`.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { state } = useAppState()
  const locale = state.settings.locale ?? 'es-419'
  const currency = state.settings.currency

  // El idioma del documento debe coincidir con el de la interfaz.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[locale]

    const t: TFunction = (key, vars) => {
      const raw = readPath(dict, key)
      if (raw === undefined) {
        // Falla ruidosamente en desarrollo: mejor verlo que traducir a ciegas.
        console.warn(`[i18n] Falta la clave "${key}" en ${locale}`)
        return key
      }
      return interpolate(raw, vars)
    }

    const currencySymbol =
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? currency

    return {
      locale,
      currency,
      t,
      currencySymbol,
      formatMoney: (value, fractionDigits) => formatMoney(value, locale, currency, fractionDigits),
      formatPercent: (fraction) => formatPercent(fraction, locale),
      formatNumber: (value) => formatNumber(value, locale),
      formatDate: (value) => formatDate(value, locale),
      formatDateTime: (value) => formatDateTime(value, locale),
      formatDuration: (days) => formatDuration(days, locale),
      currencyName: (code) => formatCurrencyName(code, locale),
      weekdays: weekdayNames(locale),
    }
  }, [locale, currency])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
