import type { ObjectiveKey, TermLength } from '../types'
import type { TranslationKey } from '../i18n/types'

export interface SavingsMethod {
  id: string
  titleKey: TranslationKey
  summaryKey: TranslationKey
  /** Quién lo respalda o dónde proviene, para poder argumentar la elección. */
  sourceKey: TranslationKey
  horizons: TermLength[]
  /** Objetivos para los que destaca; vacío = sirve para cualquiera. */
  objectives: ObjectiveKey[]
}

/**
 * Catálogo de métodos de ahorro.
 * Se eligieron prácticas con respaldo real (bancos, organismos de consumo,
 * educadores y fintechs) y se clasifican por plazo para poder recomendarlas.
 */
export const SAVINGS_METHODS: SavingsMethod[] = [
  {
    id: 'payYourselfFirst',
    titleKey: 'methods.payYourselfFirst.title',
    summaryKey: 'methods.payYourselfFirst.summary',
    sourceKey: 'methods.payYourselfFirst.source',
    horizons: ['short', 'medium', 'long'],
    objectives: [],
  },
  {
    id: 'fixedPerPayday',
    titleKey: 'methods.fixedPerPayday.title',
    summaryKey: 'methods.fixedPerPayday.summary',
    sourceKey: 'methods.fixedPerPayday.source',
    horizons: ['short', 'medium', 'long'],
    objectives: [],
  },
  {
    id: 'rule503020',
    titleKey: 'methods.rule503020.title',
    summaryKey: 'methods.rule503020.summary',
    sourceKey: 'methods.rule503020.source',
    horizons: ['short', 'medium'],
    objectives: [],
  },
  {
    id: 'emergencyFund',
    titleKey: 'methods.emergencyFund.title',
    summaryKey: 'methods.emergencyFund.summary',
    sourceKey: 'methods.emergencyFund.source',
    horizons: ['short', 'medium'],
    objectives: ['emergency'],
  },
  {
    id: 'roundUp',
    titleKey: 'methods.roundUp.title',
    summaryKey: 'methods.roundUp.summary',
    sourceKey: 'methods.roundUp.source',
    horizons: ['short'],
    objectives: ['phone', 'tools', 'custom'],
  },
  {
    id: 'envelopeBudget',
    titleKey: 'methods.envelopeBudget.title',
    summaryKey: 'methods.envelopeBudget.summary',
    sourceKey: 'methods.envelopeBudget.source',
    horizons: ['short'],
    objectives: ['debt'],
  },
  {
    id: 'debtAvalanche',
    titleKey: 'methods.debtAvalanche.title',
    summaryKey: 'methods.debtAvalanche.summary',
    sourceKey: 'methods.debtAvalanche.source',
    horizons: ['short', 'medium'],
    objectives: ['debt'],
  },
  {
    id: 'challenge52',
    titleKey: 'methods.challenge52.title',
    summaryKey: 'methods.challenge52.summary',
    sourceKey: 'methods.challenge52.source',
    horizons: ['short', 'medium'],
    objectives: [],
  },
  {
    id: 'highYieldSavings',
    titleKey: 'methods.highYieldSavings.title',
    summaryKey: 'methods.highYieldSavings.summary',
    sourceKey: 'methods.highYieldSavings.source',
    horizons: ['short', 'medium'],
    objectives: ['emergency'],
  },
  {
    id: 'fixedTermDeposit',
    titleKey: 'methods.fixedTermDeposit.title',
    summaryKey: 'methods.fixedTermDeposit.summary',
    sourceKey: 'methods.fixedTermDeposit.source',
    horizons: ['medium'],
    objectives: ['investment', 'home', 'tools'],
  },
  {
    id: 'cdLadder',
    titleKey: 'methods.cdLadder.title',
    summaryKey: 'methods.cdLadder.summary',
    sourceKey: 'methods.cdLadder.source',
    horizons: ['medium', 'long'],
    objectives: ['investment', 'home'],
  },
  {
    id: 'investPeriodic',
    titleKey: 'methods.investPeriodic.title',
    summaryKey: 'methods.investPeriodic.summary',
    sourceKey: 'methods.investPeriodic.source',
    horizons: ['long'],
    objectives: ['investment', 'education', 'vehicle', 'home'],
  },
]

export function findMethod(id: string): SavingsMethod {
  return SAVINGS_METHODS.find((method) => method.id === id) ?? SAVINGS_METHODS[0]
}

interface RecommendationInput {
  term: TermLength
  objective: ObjectiveKey
}

/**
 * Ordena los métodos por encaje: primero los que soportan el plazo y luego los
 * que destacan para el objetivo de la meta (los universales siempre puntúan).
 */
function scoreMethod(method: SavingsMethod, { term, objective }: RecommendationInput): number {
  const termMatch = method.horizons.includes(term) ? 3 : 0
  const objectiveMatch = method.objectives.includes(objective) ? 2 : 0
  const isUniversal = method.objectives.length === 0 ? 1 : 0
  return termMatch + objectiveMatch + isUniversal
}

/** Top de métodos sugeridos para una meta concreta (3 como máximo). */
export function recommendMethods(input: RecommendationInput, limit = 3): SavingsMethod[] {
  return SAVINGS_METHODS.map((method) => ({ method, score: scoreMethod(method, input) }))
    .filter(({ score }) => score >= 3) // al menos que el plazo encaje
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ method }) => method)
}

/** Catálogo completo ordenado por encaje (para la lista desplegable). */
export function rankMethods(input: RecommendationInput): SavingsMethod[] {
  return [...SAVINGS_METHODS].sort(
    (a, b) => scoreMethod(b, input) - scoreMethod(a, input),
  )
}
