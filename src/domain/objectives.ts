import type { ObjectiveKey } from '../types'
import type { TranslationKey } from '../i18n/types'

export interface ObjectiveMeta {
  key: ObjectiveKey
  emoji: string
  titleKey: TranslationKey
}

/** Objetivos más comunes del mercado + el personalizado. */
export const OBJECTIVES: ObjectiveMeta[] = [
  { key: 'vehicle', emoji: '🚗', titleKey: 'objectives.vehicle' },
  { key: 'phone', emoji: '📱', titleKey: 'objectives.phone' },
  { key: 'tools', emoji: '🔧', titleKey: 'objectives.tools' },
  { key: 'investment', emoji: '📈', titleKey: 'objectives.investment' },
  { key: 'home', emoji: '🏠', titleKey: 'objectives.home' },
  { key: 'travel', emoji: '✈️', titleKey: 'objectives.travel' },
  { key: 'education', emoji: '🎓', titleKey: 'objectives.education' },
  { key: 'emergency', emoji: '🛟', titleKey: 'objectives.emergency' },
  { key: 'debt', emoji: '🧯', titleKey: 'objectives.debt' },
  { key: 'custom', emoji: '✨', titleKey: 'objectives.custom' },
]

export function findObjective(key: ObjectiveKey): ObjectiveMeta {
  return OBJECTIVES.find((objective) => objective.key === key) ?? OBJECTIVES.at(-1)!
}
