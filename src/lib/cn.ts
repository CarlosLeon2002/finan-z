/** Une clases condicionales sin librerías: `cn('a', isActive && 'b')`. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
