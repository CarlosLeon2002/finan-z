import type { AccentId, AppState, ChartStyle, ThemeMode } from '../types'
import { ACCENT_IDS, CHART_STYLES } from '../types'

/**
 * Persistencia local: un único registro en `localStorage`.
 *
 * Todo lo que el usuario ingresa vive aquí y en ninguna otra parte; no hay
 * llamadas de red ni copias en la nube. El service worker de la PWA se encarga
 * del caché de los archivos de la app (para que abra sin conexión).
 */

const STORAGE_KEY = 'finanzas-personales::state'
const SCHEMA_VERSION = 1 as const

interface StoredRecord {
  savedAt: string
  data: AppState
}

/** Comprobación defensiva: si el registro no parece válido, no se usa. */
function isStoredRecord(value: unknown): value is StoredRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Partial<StoredRecord>
  if (typeof record.savedAt !== 'string') return false

  const data = record.data as Partial<AppState> | undefined
  if (!data || typeof data !== 'object') return false
  if (data.version !== SCHEMA_VERSION) return false
  if (!data.settings || typeof data.settings.currency !== 'string') return false
  if (!Array.isArray(data.categories) || !Array.isArray(data.goals)) return false
  if (!data.income || typeof data.income.netAmount !== 'number') return false

  return true
}

/**
 * Rellena preferencias de interfaz añadidas después de la primera versión.
 * Un registro v1 anterior a `accent`/`themeMode`/`chartStyle` sigue siendo
 * válido: aquí se completan con los valores por defecto sin tocar datos.
 */
function withAppearance(data: AppState): AppState {
  const accentOk = ACCENT_IDS.includes(data.settings.accent)
  const modeList: ThemeMode[] = ['auto', 'light', 'dark']
  const modeOk = modeList.includes(data.settings.themeMode)
  const chartOk = CHART_STYLES.includes(data.settings.chartStyle)
  if (accentOk && modeOk && chartOk) return data

  return {
    ...data,
    settings: {
      ...data.settings,
      accent: accentOk ? data.settings.accent : ('indigo' as AccentId),
      themeMode: modeOk ? data.settings.themeMode : 'auto',
      chartStyle: chartOk ? data.settings.chartStyle : ('donut' as ChartStyle),
    },
  }
}

/** Devuelve el estado guardado o `null` si no existe / está corrupto. */
export function loadState(): AppState | null {
  if (typeof localStorage === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isStoredRecord(parsed)) {
      // Registro ilegible: lo retiramos para evitar arrastrar datos corruptos.
      clearState()
      return null
    }
    return withAppearance(parsed.data)
  } catch {
    return null
  }
}

/** Guarda el estado completo. Devuelve `false` si el navegador lo rechazó. */
export function saveState(state: AppState): boolean {
  if (typeof localStorage === 'undefined') return false

  const record: StoredRecord = { savedAt: new Date().toISOString(), data: state }
  try {
    // Otra pestaña puede haber escrito lo mismo (sincronización en vivo): no se
    // reescribe para evitar un ping-pong de eventos `storage` entre pestañas.
    const current = localStorage.getItem(STORAGE_KEY)
    if (current) {
      const parsed = JSON.parse(current) as Partial<StoredRecord> | null
      if (parsed?.data && JSON.stringify(parsed.data) === JSON.stringify(state)) return true
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    return true
  } catch (error) {
    // Suele ser cuota llena; se informa en consola y la sesión sigue en memoria.
    console.warn('No se pudo guardar en localStorage', error)
    return false
  }
}

/** Elimina el registro local (reseteo total de la app). */
export function clearState(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('No se pudo eliminar el registro local', error)
  }
}

/** Instantánea del estado que llega desde otra pestaña. */
export interface StorageSnapshot {
  data: AppState
  savedAt: string
}

/**
 * Escucha cambios hechos en otra pestaña/ventana del mismo navegador.
 * Devuelve la función para cancelar la suscripción.
 */
export function subscribeToStorage(
  listener: (snapshot: StorageSnapshot) => void,
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return
    try {
      const parsed: unknown = JSON.parse(event.newValue)
      if (!isStoredRecord(parsed)) return
      listener({ data: withAppearance(parsed.data), savedAt: parsed.savedAt })
    } catch {
      // Otro contexto escribió un registro ilegible: se ignora sin romper la app.
    }
  }

  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

/** Marca de última guardado (`ISO string`) o `null` si nunca se guardó. */
export function getSavedAt(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isStoredRecord(parsed)) return null
    return parsed.savedAt
  } catch {
    return null
  }
}

/** Peso en bytes del estado serializado (para mostrar uso de almacenamiento). */
export function getStateSize(state: AppState): number {
  const record: StoredRecord = { savedAt: '', data: state }
  return new Blob([JSON.stringify(record)]).size
}
