# Finan-Z

PWA personal para organizar el dinero: registra tu ingreso neto, repártelo en una
gráfica tipo torta, crea metas de ahorro con plazo y método, y recibe un consejo
cada día. **Sin cuentas, sin nube, sin rastreo**: todo vive en el `localStorage`
del dispositivo y la app funciona sin conexión.

## Funciones

- **Partición del ingreso**: monto neto, frecuencia de cobro (semanal, quincenal,
  mensual o cada N días) y categorías personalizables (emoji, color, monto) con
  gráfica interactiva de distribución. Cada cambio se refleja al instante, sin
  recargar, y también se sincroniza entre pestañas abiertas.
- **Visualizaciones**: la gráfica principal se elige en Ajustes entre cuatro
  estilos —**Dona**, **Barras** (ranking), **Medidor** (% asignado) y
  **Apilada** (ingreso dividido)— con degradados, animaciones suaves y tooltips
  flotantes de cristal. Se complementan con anillos de progreso en cada meta,
  sparklines en las métricas del Panel y barras de aportes en el detalle.
- **Metas de ahorro**: objetivo predefinido (vehículo, teléfono, herramientas,
  inversiones, etc.) o personalizado; plazo por duración (días/meses/años) o por
  número de cobros salariales; métodos de ahorro respaldados por entidades
  financieras adaptados al plazo; proyección de fecha de cumplimiento, registro
  de aportes con atajos de “aporte sugerido” y “completar meta”, y pantalla de
  celebración con confeti al llegar al 100 %.
- **Tips diarios y frases** de referentes, con índice completo y detalle.
- **Ajustes**: idioma (español hispanoamericano / inglés de EE. UU.), moneda,
  exportación de todos los datos a `.txt`, reinicio de datos e instalación como
  app (PWA).

## Comandos

| Comando           | Qué hace                                            |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con HMR                      |
| `npm run build`   | Type-check (`tsc -b`) + build de producción con PWA |
| `npm run preview` | Sirve el build de producción en local               |
| `npm run lint`    | Oxlint sobre todo el código                         |
| `npm run icons`   | Regenera los iconos PNG del manifest                |
| `npm run smoke`   | Smoke test funcional (Puppeteer) sobre el preview   |
| `npm run capture` | Capturas de la UI en varios temas (revisión visual) |

## Estructura

```
src/
├── app/          Estado global, i18n y router (por hash, sin dependencias)
├── charts/       Registro de Chart.js, tema claro/oscuro y visualizaciones
│                 (dona, barras, medidor, apilada, anillos, sparklines)
├── components/   UI genérica (ui/) y layout (layout/AppShell)
├── domain/       Lógica pura: metas, partición, ingreso, métodos, tips
├── features/     Pantallas: dashboard, partition, savings, tips, settings,
│                 onboarding (selector de idioma) y exportación
├── hooks/        Utilidades de entrada reutilizables
├── i18n/         Diccionarios es-419 / en-US, formato y tipado de claves
├── lib/          Helpers de fechas, ids y clases (cn)
├── storage/      Lectura/escritura del registro único en localStorage
├── theme/        Presets de acento y provider de tema (claro/oscuro/auto)
└── types/        Tipos compartidos (schema v1)
```

## Decisiones de arquitectura (y por qué)

- **Un único registro en `localStorage`** (`finanzas-personales::state`): leer y
  escribir un objeto completo es más simple, más rápido y más fácil de exportar
  que múltiples claves sueltas; el schema versionado (`schema: 1`) deja la puerta
  abierta a migraciones.
- **Router por hash sin librería**: cinco rutas (`#/home`, `#/savings`,
  `#/partition`, `#/tips`, `#/settings`) no justifican la dependencia de un
  router; con `hashchange` alcanza y funciona igual en file:// y en caché.
- **Contextos separados de sus providers** (`app/state.ts` + `app/StateProvider.tsx`,
  `app/i18n.ts` + `app/I18nProvider.tsx`, `theme/theme.ts` + `theme/ThemeProvider.tsx`):
  los componentes consumen hooks desde el módulo de contexto, lo que preserva el
  Fast Refresh de Vite.
- **i18n propio y tipado**: `es-419.ts` es la fuente de verdad; `en-US.ts` se
  declara como `typeof es419`, así que agregar o renombrar una clave en español
  rompe la compilación si falta en inglés.
- **Estado que se ajusta durante el render** (patrón `prevKey`) en los diálogos
  y en `useNumberInput`: limpiar el formulario al abrir/cambiar de registro sin
  efectos que disparen renders en cascada.
- **Iconos generados sin dependencias** (`scripts/generate-icons.mjs`): escribe
  PNGs usando el módulo `zlib` nativo; se regeneran con `npm run icons`.

## Sistema de diseño

- **Mobile-first**: barra de navegación inferior flotante en todos los tamaños,
  con iconos grandes, etiqueta, estado activo bien marcado y respeto al área
  segura (notch/home bar). Las gráficas usan alturas responsivas para no
  desbordar en pantallas pequeñas.
- **Tipografía “Precisión Financiera”** (auto-alojada, funciona offline):
  `Space Grotesk` en títulos, `Inter` en el cuerpo y `Outfit` (geométrica,
  cifras tabulares) en las cifras destacadas. Se eligió por su aire limpio y
  moderno, propio de herramientas financieras.
- **Sistema de acentos**: el color de marca vive en `theme/accents.ts` (fuente
  única) y se aplica como tokens `--color-primary*` sobre `<html>`. Hay 8
  presets —Índigo (por defecto), V-Rock (magenta neón), Océano, Esmeralda,
  Violeta, Ámbar, Rosa y Grafito— con versiones claro/oscuro. Las gráficas
  leen la misma paleta, así que interfaz y canvas siempre coinciden.
- **Modo de tema** claro/oscuro/automático vía `data-theme` en `<html>`; un
  script inline lo aplica antes del primer pintado para evitar parpadeos.

## PWA y privacidad

- `vite-plugin-pwa` genera el manifest y un service worker (Workbox) que cachea
  los assets: la app abre y funciona sin conexión.
- **No hay peticiones de red con datos del usuario.** Ni registro, ni analytics,
  ni sincronización: si borras los datos del navegador, desaparecen (por eso la
  exportación a `.txt` existe).

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind CSS v4 · Chart.js +
react-chartjs-2 · canvas-confetti · vite-plugin-pwa · Oxlint
