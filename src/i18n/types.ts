import type { es419 } from './es-419'

export type Dict = typeof es419

/**
 * Genera las rutas de traducción como uniones de strings, por ejemplo:
 * `'savings.title'` | `'presets.housing.label'` | `'methods.roundUp.source'`.
 * Así un typo en `t(...)` hace fallar la compilación.
 */
export type LeafPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafPaths<T[K]>}`
    }[keyof T & string]

export type TranslationKey = LeafPaths<Dict>

/** Valores que se interpolan entre llaves: `t('x', { amount: 12 })`. */
export type TranslationVars = Record<string, string | number>

export type TFunction = (key: TranslationKey, vars?: TranslationVars) => string
