import { useState, type ChangeEvent } from 'react'

/**
 * Convierte lo que se escribe en un input monetario a número, aceptando tanto
 * el punto como la coma decimales y los separadores de miles:
 * "1.234,56" → 1234.56 · "1,500" → 1500 · "12.5" → 12.5
 */
export function parseAmount(raw: string): number {
  const text = raw.replace(/[^\d.,]/g, '')
  if (!text) return 0

  const separatorIndex = Math.max(text.lastIndexOf('.'), text.lastIndexOf(','))
  if (separatorIndex === -1) return Number(text) || 0

  const integerPart = text.slice(0, separatorIndex).replace(/[.,]/g, '')
  const decimalPart = text.slice(separatorIndex + 1)
  // Un separador con 3 dígitos detrás se trata como miles ("1,500").
  const isThousands = decimalPart.length === 0 || decimalPart.length === 3

  if (isThousands) return Number(`${integerPart}${decimalPart}`) || 0
  return Number(`${integerPart}.${decimalPart}`) || 0
}

/**
 * Input monetario controlado que conserva mientras se escribe lo que la
 * persona teclea (p. ej. "1500.") sin perder el valor numérico ya guardado.
 */
export function useNumberInput(value: number, onChange: (value: number) => void) {
  const [draft, setDraft] = useState(() => (value ? String(value) : ''))

  // Solo se sincroniza si el valor externo difiere del que estamos escribiendo
  // (evita borrar el punto decimal mientras el usuario sigue escribiendo).
  const [prevValue, setPrevValue] = useState(value)
  if (prevValue !== value) {
    setPrevValue(value)
    if (parseAmount(draft) !== value) {
      setDraft(value ? String(value) : '')
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    if (raw !== '' && !/^\d*[.,]?\d{0,6}$/.test(raw)) return
    setDraft(raw)
    onChange(parseAmount(raw))
  }

  return { value: draft, onChange: handleChange }
}
