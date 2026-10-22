import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Interpola un número cuando cambia, para que las cifras de los paneles no
 * salten de golpe. Respeta `prefers-reduced-motion` y se reinicia sin conflicto
 * si el valor vuelve a cambiar a mitad de la animación.
 */
export function useAnimatedNumber(target: number, duration = 620): number {
  const [value, setValue] = useState(target)
  const [reducedMotion] = useState(prefersReducedMotion)
  const renderedRef = useRef(target)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (reducedMotion) return

    const from = renderedRef.current
    const delta = target - from
    if (Math.abs(delta) < 0.005) {
      renderedRef.current = target
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      const next = from + delta * eased
      renderedRef.current = next
      setValue(next)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        renderedRef.current = target
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, reducedMotion])

  return reducedMotion ? target : value
}
