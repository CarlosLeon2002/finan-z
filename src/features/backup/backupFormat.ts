import type { AppState } from '../../types'
import { isISODateTime, isRecord, parseAppState } from '../../storage/schema'
import { APP_VERSION } from '../../lib/appVersion'

/**
 * Formato de respaldo `.txt`.
 *
 * El archivo tiene una parte legible (la que ya exporta la app) y un bloque
 * estructurado entre marcadores. La firma SHA-256 cubre el JSON exacto, así que
 * cualquier edición, corte o pegado incompleto se detecta antes de restaurar.
 *
 *   # FINAN-Z:BACKUP:1
 *   # GENERATED:2026-10-21T...
 *   # CHECKSUM:sha256:<64 hex>
 *   # PAYLOAD-BEGIN
 *   { "format": "finan-z/backup", ... }
 *   # PAYLOAD-END
 */

export const BACKUP_MARKER = '# FINAN-Z:BACKUP:1'
export const BACKUP_CHECKSUM_PREFIX = '# CHECKSUM:sha256:'
export const BACKUP_GENERATED_PREFIX = '# GENERATED:'
export const BACKUP_BEGIN = '# PAYLOAD-BEGIN'
export const BACKUP_END = '# PAYLOAD-END'
export const BACKUP_FORMAT = 'finan-z/backup'
export const BACKUP_FORMAT_VERSION = 1
export const MAX_BACKUP_BYTES = 8 * 1024 * 1024

interface BackupEnvelope {
  format: typeof BACKUP_FORMAT
  formatVersion: typeof BACKUP_FORMAT_VERSION
  appVersion: string
  exportedAt: string
  state: AppState
}

export interface BackupPreview {
  state: AppState
  exportedAt: string
  appVersion: string
  checksum: string
}

export type BackupErrorCode =
  | 'empty'
  | 'tooLarge'
  | 'notBackup'
  | 'unsupported'
  | 'checksum'
  | 'corrupt'
  | 'schema'

export class BackupError extends Error {
  readonly code: BackupErrorCode

  constructor(code: BackupErrorCode) {
    super(code)
    this.name = 'BackupError'
    this.code = code
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function sha256(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    // Sin Web Crypto no se puede verificar la firma: es más seguro no restaurar.
    throw new BackupError('unsupported')
  }
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  )
  return toHex(new Uint8Array(digest))
}

function buildEnvelope(state: AppState): BackupEnvelope {
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
}

/** Bloque estructurado listo para anexar al final del reporte legible. */
export async function buildBackupBlock(state: AppState): Promise<string> {
  const envelope = buildEnvelope(state)
  const payload = JSON.stringify(envelope, null, 2)
  const checksum = await sha256(payload)

  return [
    BACKUP_MARKER,
    `${BACKUP_GENERATED_PREFIX}${envelope.exportedAt}`,
    `${BACKUP_CHECKSUM_PREFIX}${checksum}`,
    BACKUP_BEGIN,
    payload,
    BACKUP_END,
  ].join('\n')
}

/** Parsea y valida un respaldo completo. Lanza `BackupError` si no es válido. */
export async function parseBackupText(text: string): Promise<BackupPreview> {
  if (!text.trim()) throw new BackupError('empty')
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) {
    throw new BackupError('tooLarge')
  }

  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const markerIndex = lines.findIndex((line) => line.trim() === BACKUP_MARKER)
  if (markerIndex < 0) throw new BackupError('notBackup')

  // Un archivo con dos cabeceras es ambiguo: no se intenta adivinar.
  const duplicateHeader = lines.some(
    (line, index) => index > markerIndex && line.trim() === BACKUP_MARKER,
  )
  if (duplicateHeader) throw new BackupError('corrupt')

  const beginIndex = lines.findIndex(
    (line, index) => index > markerIndex && line.trim() === BACKUP_BEGIN,
  )
  if (beginIndex < 0) throw new BackupError('corrupt')

  const endIndex = lines.findIndex(
    (line, index) => index > beginIndex && line.trim() === BACKUP_END,
  )
  if (endIndex < 0) throw new BackupError('corrupt')

  const metadata = lines.slice(markerIndex + 1, beginIndex)
  const checksumLine = metadata.find((line) => line.startsWith(BACKUP_CHECKSUM_PREFIX))
  if (!checksumLine) throw new BackupError('checksum')

  const expected = checksumLine.slice(BACKUP_CHECKSUM_PREFIX.length).trim().toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(expected)) throw new BackupError('checksum')

  const payload = lines.slice(beginIndex + 1, endIndex).join('\n')
  if (!payload.trim()) throw new BackupError('corrupt')

  const actual = await sha256(payload)
  if (actual !== expected) throw new BackupError('checksum')

  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    throw new BackupError('corrupt')
  }

  if (!isRecord(parsed)) throw new BackupError('corrupt')
  if (parsed.format !== BACKUP_FORMAT) throw new BackupError('notBackup')
  if (parsed.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new BackupError('unsupported')
  }
  if (typeof parsed.appVersion !== 'string' || !isISODateTime(parsed.exportedAt)) {
    throw new BackupError('corrupt')
  }

  const result = parseAppState(parsed.state)
  if (!result.ok) throw new BackupError('schema')

  return {
    state: result.value,
    exportedAt: parsed.exportedAt,
    appVersion: parsed.appVersion,
    checksum: expected,
  }
}
