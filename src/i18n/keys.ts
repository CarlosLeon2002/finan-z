import type { PayFrequency, TermLength } from '../types'
import type { TranslationKey } from './types'

/** Traducciones que dependen de datos de dominio (para no repetirlas). */

export const TERM_LABEL_KEY: Record<TermLength, TranslationKey> = {
  short: 'savings.termShort',
  medium: 'savings.termMedium',
  long: 'savings.termLong',
}

export const FREQUENCY_LABEL_KEY: Record<PayFrequency, TranslationKey> = {
  weekly: 'partition.frequencyWeekly',
  biweekly: 'partition.frequencyBiweekly',
  monthly: 'partition.frequencyMonthly',
  custom: 'partition.frequencyCustom',
}
