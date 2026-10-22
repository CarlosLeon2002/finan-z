import { createContext, useContext } from 'react'
import type { TFunction } from '../i18n/types'
import type { CurrencyCode, Locale } from '../types'

/** Traducciones + formateo según el idioma y la moneda elegidos. */
export interface I18nValue {
  locale: Locale
  currency: CurrencyCode
  t: TFunction
  /** Símbolo de la moneda activa (para pintarlo junto a los inputs). */
  currencySymbol: string
  formatMoney: (value: number, fractionDigits?: number) => string
  formatPercent: (fraction: number) => string
  formatNumber: (value: number) => string
  formatDate: (value: string | Date) => string
  formatDateTime: (value: string | Date) => string
  formatDuration: (days: number) => string
  currencyName: (code: CurrencyCode) => string
  weekdays: string[]
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  }
  return context
}
