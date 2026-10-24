/**
 * Genera los iconos de la PWA (PNG) sin dependencias: solo zlib de Node.
 * Uso: npm run icons
 *
 * Se dibuja la Z de la marca sobre un degradado verde. Se exportan cuatro
 * tamaños:
 *  - icon-192.png / icon-512.png  -> instalación normal (esquinas redondeadas)
 *  - icon-maskable-512.png        -> zona segura del 80 % (Android)
 *  - apple-touch-icon.png         -> iOS
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/* ------------------------------------------------------------------ PNG ---- */

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c
})

function crc32(buffer) {
  let c = -1
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // color type: RGBA

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filtro "None" por fila
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/* --------------------------------------------------------------- canvas ---- */

const hex = (value) => [
  Number.parseInt(value.slice(1, 3), 16),
  Number.parseInt(value.slice(3, 5), 16),
  Number.parseInt(value.slice(5, 7), 16),
]

function createCanvas(size) {
  const data = new Uint8Array(size * size * 4)

  const setPixel = (x, y, rgb, alpha) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (Math.floor(y) * size + Math.floor(x)) * 4
    data[i] = rgb[0]
    data[i + 1] = rgb[1]
    data[i + 2] = rgb[2]
    data[i + 3] = alpha
  }

  return {
    /** Rectángulo con esquinas redondeadas (distancia a esquina, bordes limpios). */
    roundedRect(x, y, w, h, radius, color, alpha = 255) {
      const rgb = typeof color === 'string' ? hex(color) : color
      for (let py = Math.floor(y); py < Math.ceil(y + h); py++) {
        for (let px = Math.floor(x); px < Math.ceil(x + w); px++) {
          const cx = Math.min(Math.max(px + 0.5, x + radius), x + w - radius)
          const cy = Math.min(Math.max(py + 0.5, y + radius), y + h - radius)
          if (Math.hypot(px + 0.5 - cx, py + 0.5 - cy) <= radius) setPixel(px, py, rgb, alpha)
        }
      }
    },

    /** Segmento de grosor constante (trazos de la flecha). */
    segment(x1, y1, x2, y2, width, color, alpha = 255) {
      const rgb = typeof color === 'string' ? hex(color) : color
      const dx = x2 - x1
      const dy = y2 - y1
      const len = dx * dx + dy * dy || 1
      const pad = Math.ceil(width)
      for (let py = Math.floor(Math.min(y1, y2) - pad); py <= Math.ceil(Math.max(y1, y2) + pad); py++) {
        for (let px = Math.floor(Math.min(x1, x2) - pad); px <= Math.ceil(Math.max(x1, x2) + pad); px++) {
          const t = Math.min(1, Math.max(0, ((px - x1) * dx + (py - y1) * dy) / len))
          if (Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)) <= width / 2) {
            setPixel(px, py, rgb, alpha)
          }
        }
      }
    },

    /** Degradado vertical entre dos colores. */
    gradient(topColor, bottomColor) {
      const [r1, g1, b1] = hex(topColor)
      const [r2, g2, b2] = hex(bottomColor)
      for (let y = 0; y < size; y++) {
        const t = y / (size - 1)
        const rgb = [
          Math.round(r1 + (r2 - r1) * t),
          Math.round(g1 + (g2 - g1) * t),
          Math.round(b1 + (b2 - b1) * t),
        ]
        for (let x = 0; x < size; x++) setPixel(x, y, rgb, 255)
      }
    },

    /** Deja transparente todo lo que quede fuera de un cuadro redondeado. */
    clipRoundedCorners(radius) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const cx = Math.min(Math.max(x + 0.5, radius), size - radius)
          const cy = Math.min(Math.max(y + 0.5, radius), size - radius)
          if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > radius) {
            data[(y * size + x) * 4 + 3] = 0
          }
        }
      }
    },

    toPng() {
      return encodePng(size, size, Buffer.from(data))
    },
  }
}

/* ---------------------------------------------------------------- icono ---- */

const TOP = '#21a97a'
const BOTTOM = '#075a40'
const GLYPH = '#ffffff'

/**
 * @param {number} size lienzo cuadrado
 * @param {{ roundCorners?: boolean, inset?: number }} options
 *   roundCorners recorta el fondo; `inset` escala el glifo (zona segura maskable).
 */
function drawIcon(size, { roundCorners = true, inset = 1 } = {}) {
  const canvas = createCanvas(size)
  canvas.gradient(TOP, BOTTOM)

  // Coordenadas normalizadas de la Z, escaladas hacia el centro.
  const map = (value) => (value - 0.5) * inset * size + size / 2
  const unit = (value) => value * inset * size
  const stroke = unit(0.085)

  const topY = map(0.27)
  const bottomY = map(0.73)
  const leftX = map(0.2)
  const rightX = map(0.8)

  canvas.segment(leftX, topY, rightX, topY, stroke, GLYPH)
  canvas.segment(rightX, topY, leftX, bottomY, stroke, GLYPH)
  canvas.segment(leftX, bottomY, rightX, bottomY, stroke, GLYPH)

  if (roundCorners) canvas.clipRoundedCorners(size * 0.22)

  return canvas
}

/* ---------------------------------------------------------------- salida ---- */

const targets = [
  { file: 'icons/icon-192.png', size: 192, options: { roundCorners: true } },
  { file: 'icons/icon-512.png', size: 512, options: { roundCorners: true } },
  { file: 'icons/icon-maskable-512.png', size: 512, options: { roundCorners: false, inset: 0.72 } },
  { file: 'icons/apple-touch-icon.png', size: 180, options: { roundCorners: false, inset: 0.9 } },
]

for (const target of targets) {
  const path = join(ROOT, 'public', target.file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, drawIcon(target.size, target.options).toPng())
  console.log(`ok ${target.file}`)
}
