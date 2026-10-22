import type { AppState } from '../types'
import { isRecord, normalizeStoredState } from './schema'

/**
 * Persistencia local: un único registro en `localStorage`.
 *
 * Todo lo que el usuario ingresa vive aquí y en ninguna otra parte; no hay
 * llamadas de red ni copias en la nube. El service worker de la PWA se encarga
 * del caché de los archivos de la app (para que abra sin conexión).
 */

const STORAGE_KEY = 'finanzas-personales::state'

interface StoredRecord {
  savedAt: string
  data: AppState
}

/**
 * Lee un registro y normaliza las preferencias añadidas en versiones nuevas.
 * Si el contenido no cumple el esquema, devuelve `null` para no arrastrar
 * datos corruptos.
 */
function parseRecord(value: unknown): StoredRecord | null {
  if (!isRecord(value)) return null
  if (typeof value.savedAt !== 'string') return null

  const data = normalizeStoredState(value.data)
  if (!data) return null

  return { savedAt: value.savedAt, data }
}

/** Devuelve el estado guardado o `null` si no existe / está corrupto. */
export function loadState(): AppState | null {
  if (typeof localStorage === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const record = parseRecord(JSON.parse(raw))
    if (!record) {
      // Registro ilegible: lo retiramos para evitar arrastrar datos corruptos.
      clearState()
      return null
    }
    return record.data
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
      const record = parseRecord(JSON.parse(event.newValue))
      if (!record) return
      listener({ data: record.data, savedAt: record.savedAt })
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
    const record = parseRecord(JSON.parse(raw))
    return record?.savedAt ?? null
  } catch {
    return null
  }
}

/** Peso en bytes del estado serializado (para mostrar uso de almacenamiento). */
export function getStateSize(state: AppState): number {
  const record: StoredRecord = { savedAt: '', data: state }
  return new Blob([JSON.stringify(record)]).size
}
