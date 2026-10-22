import confetti from 'canvas-confetti'

/** Lee los colores del tema activo (acento + semánticos) desde los tokens CSS. */
function themeColors(): string[] {
  if (typeof window === 'undefined') return ['#4a51c8', '#0e9167']
  const styles = getComputedStyle(document.documentElement)
  const read = (token: string, fallback: string) => styles.getPropertyValue(token).trim() || fallback
  return [
    read('--color-primary', '#4a51c8'),
    read('--color-primary-strong', '#3f45ac'),
    read('--color-success', '#0e9167'),
    read('--color-warning', '#c98209'),
    '#ffffff',
  ]
}

/**
 * Celebración contenida al completar una meta: un estallido central y dos
 * cañones laterales, con los colores del tema. Se omite por completo si la
 * persona pidió menos movimiento en su sistema.
 */
export function celebrateGoal(): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const shared = {
    colors: themeColors(),
    disableForReducedMotion: true,
    ticks: 160,
    gravity: 0.95,
    scalar: 0.95,
    zIndex: 90,
  }

  confetti({
    ...shared,
    particleCount: 80,
    spread: 72,
    startVelocity: 44,
    origin: { x: 0.5, y: 0.62 },
    shapes: ['circle', 'square'],
  })

  window.setTimeout(() => {
    confetti({
      ...shared,
      particleCount: 42,
      angle: 62,
      spread: 58,
      startVelocity: 38,
      origin: { x: 0.06, y: 0.76 },
    })
    confetti({
      ...shared,
      particleCount: 42,
      angle: 118,
      spread: 58,
      startVelocity: 38,
      origin: { x: 0.94, y: 0.76 },
    })
  }, 170)
  // La celebración dura lo que un respiro: el canvas se retira solo.
  const cleanup = confetti as unknown as { reset?: () => void }
  window.setTimeout(() => cleanup.reset?.(), 1600)
}
