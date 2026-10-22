/** Fecha de hoy en formato corto `YYYY-MM-DD` (sin zona horaria, es solo un día). */
export function todayISO(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Convierte `YYYY-MM-DD` a `Date` interpretándolo como día local. */
export function fromISO(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

/** Convierte una `Date` a `YYYY-MM-DD`. */
export function toISO(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Número de días naturales entre dos fechas (positivo si `to` es posterior). */
export function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 86_400_000
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((end - start) / MS_PER_DAY)
}

/** Suma un número de días a una fecha devolviendo una nueva `Date`. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
