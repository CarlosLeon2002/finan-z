import type { AccentId } from '../types'

/**
 * Paleta de acento: fuente única de verdad para el color de marca.
 *
 * La interfaz la aplica como propiedades en línea sobre `<html>` (ThemeProvider)
 * y las gráficas la leen directamente desde aquí, de modo que ambas siempre
 * coinciden. Cada preset define solo su matiz base (claro/oscuro); el resto de
 * tonos se derivan para que queden coherentes en cualquier acento.
 */

interface Rgb {
  r: number
  g: number
  b: number
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }
const DARK_BG: Rgb = { r: 10, g: 14, b: 26 } // superficie base en modo oscuro

function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '')
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (channel: number) =>
    Math.round(Math.min(255, Math.max(0, channel)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Mezcla: `t` es el peso del primer color (0..1). */
function mix(a: Rgb, b: Rgb, t: number): string {
  return rgbToHex({
    r: a.r * t + b.r * (1 - t),
    g: a.g * t + b.g * (1 - t),
    b: a.b * t + b.b * (1 - t),
  })
}

const lighten = (hex: string, amount: number) => mix(hexToRgb(hex), WHITE, 1 - amount)
const darken = (hex: string, amount: number) => mix(hexToRgb(hex), BLACK, 1 - amount)

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** Texto que mejor contrasta sobre el color principal (blanco o verde tinta). */
function readableOn(background: string): string {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#08130e')
    ? '#ffffff'
    : '#08130e'
}

/** Matiz base de cada preset: tono en claro y su versión luminosa en oscuro. */
const BASE: Record<AccentId, { light: string; dark: string }> = {
  // `indigo` conserva su identificador histórico, pero desde 1.2.1 es el verde
  // de marca. Así los datos guardados siguen siendo compatibles.
  indigo: { light: '#0f7a55', dark: '#54d6a0' },
  // Rosa intenso y legible; los tonos suaves derivados son pastel.
  vrock: { light: '#c2418a', dark: '#c9558c' },
  ocean: { light: '#1e88d6', dark: '#54b6f0' },
  emerald: { light: '#0d9488', dark: '#5eead4' },
  violet: { light: '#7d4fe0', dark: '#a78bfa' },
  amber: { light: '#c8871a', dark: '#f6bf4a' },
  rose: { light: '#e04470', dark: '#fb7189' },
  graphite: { light: '#515c6e', dark: '#9aa6b8' },
}

export interface AccentColors {
  /** Color principal (botones, enlaces, líneas de las gráficas). */
  primary: string
  /** Texto legible sobre el color principal. */
  onPrimary: string
  /** Versión más profunda (hover, texto sobre blanco). */
  strong: string
  /** Tinte suave de fondo (chips, badges, superficies destacadas). */
  soft: string
  /** Texto legible sobre el fondo suave. */
  onSoft: string
}

export function accentColors(accent: AccentId, isDark: boolean): AccentColors {
  const base = isDark ? BASE[accent].dark : BASE[accent].light
  return isDark
    ? {
        primary: base,
        onPrimary: readableOn(base),
        strong: lighten(base, 0.14),
        soft: mix(hexToRgb(base), DARK_BG, 0.22),
        onSoft: lighten(base, 0.32),
      }
    : {
        primary: base,
        onPrimary: readableOn(base),
        strong: darken(base, 0.16),
        soft: mix(hexToRgb(base), WHITE, 0.11),
        onSoft: darken(base, 0.32),
      }
}

export interface AccentOption {
  id: AccentId
  /** Color representativo en modo claro (vista previa del selector). */
  swatch: string
  /** Texto/icono legible dentro de la muestra de color. */
  onSwatch: string
}

export const ACCENT_OPTIONS: AccentOption[] = (
  ['indigo', 'vrock', 'ocean', 'emerald', 'violet', 'amber', 'rose', 'graphite'] as AccentId[]
).map((id) => ({
  id,
  swatch: accentColors(id, false).primary,
  onSwatch: accentColors(id, false).onPrimary,
}))
