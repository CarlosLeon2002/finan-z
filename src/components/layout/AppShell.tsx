import type { ComponentType, CSSProperties, ReactNode, SVGProps } from 'react'
import { useAppState } from '../../app/state'
import { useI18n } from '../../app/i18n'
import { useRoute, type Route } from '../../app/router'
import { useTheme } from '../../theme/theme'
import { cn } from '../../lib/cn'
import type { TranslationKey } from '../../i18n/types'
import { BrandLockup } from '../brand/BrandLogo'
import {
  BulbIcon,
  GlobeIcon,
  HomeIcon,
  PieChartIcon,
  SlidersIcon,
  WalletIcon,
} from '../ui/Icon'

interface NavItem {
  route: Route
  labelKey: TranslationKey
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Tinte propio de cada acceso; se adapta al tema claro/oscuro. */
  tint: { light: string; dark: string }
}

const NAV_ITEMS: NavItem[] = [
  {
    route: 'home',
    labelKey: 'nav.home',
    Icon: HomeIcon,
    // Verde de marca: el resumen es la puerta de entrada a todo.
    tint: { light: '#0f7a55', dark: '#6ee7b7' },
  },
  {
    route: 'savings',
    labelKey: 'nav.savings',
    Icon: WalletIcon,
    tint: { light: '#0f766e', dark: '#5eead4' },
  },
  {
    route: 'partition',
    labelKey: 'nav.partition',
    Icon: PieChartIcon,
    tint: { light: '#be185d', dark: '#f9a8d4' },
  },
  {
    route: 'tips',
    labelKey: 'nav.tips',
    Icon: BulbIcon,
    // Amarillo cálido, en sintonía con la bombilla y el consejo diario.
    tint: { light: '#a16207', dark: '#fbbf24' },
  },
  {
    route: 'settings',
    labelKey: 'nav.settings',
    Icon: SlidersIcon,
    tint: { light: '#475569', dark: '#cbd5e1' },
  },
]

/**
 * Estructura de la app, pensada primero para móvil:
 * - cabecera compacta con marca y acceso rápido al idioma,
 * - barra inferior flotante (dock) con iconos grandes, etiqueta y estado
 *   activo bien marcado, siempre al alcance del pulgar,
 * - respeto al área segura (notch/home bar) en iOS.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale } = useI18n()
  const { setLocale } = useAppState()
  const { route, navigate } = useRoute()
  const { isDark } = useTheme()

  // Botón rápido de idioma en la cabecera (los detalles viven en Ajustes).
  const toggleLocale = () => setLocale(locale === 'es-419' ? 'en-US' : 'es-419')

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="h-9" aria-hidden="true" />

          <button
            type="button"
            onClick={() => navigate('home')}
            className="col-start-2 justify-self-center rounded-2xl px-1 py-1 text-left transition hover:opacity-80"
          >
            <BrandLockup
              subtitle={t('common.tagline')}
              subtitleClassName="hidden sm:block"
            />
          </button>

          <button
            type="button"
            onClick={toggleLocale}
            className="col-start-3 flex h-9 items-center gap-1.5 justify-self-end rounded-xl border border-border bg-surface px-2.5 text-sm font-medium text-muted transition hover:text-text"
            title={t('settings.language')}
            aria-label={t('settings.language')}
          >
            <GlobeIcon className="h-4.5 w-4.5" />
            <span className="uppercase">{locale === 'es-419' ? 'es' : 'en'}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 md:pt-8">
        {children}
      </main>

      {/* Dock inferior: misma navegación en móvil y escritorio. */}
      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.7rem)]"
        aria-label={t('nav.primary')}
      >
        <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-1 rounded-[1.45rem] border border-border/70 bg-surface/85 p-1.5 shadow-[0_20px_50px_-26px_rgba(10,14,26,0.55)] backdrop-blur-2xl supports-[backdrop-filter]:bg-surface/70">
          {NAV_ITEMS.map(({ route: target, labelKey, Icon, tint }) => {
            const isActive = route === target
            const color = isDark ? tint.dark : tint.light
            const style = isActive
              ? ({ '--nav-tint': color } as CSSProperties)
              : undefined

            return (
              <button
                key={target}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => navigate(target)}
                style={style}
                className={cn(
                  'group relative flex flex-1 flex-col items-center gap-0.5 rounded-[1.05rem] px-1 pb-1 pt-1.5 text-[10px] font-medium transition-colors duration-200 sm:text-[11px]',
                  isActive
                    ? 'text-[var(--nav-tint)]'
                    : 'text-muted hover:text-text',
                )}
              >
                <span className="relative grid place-items-center">
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute h-11 w-14 rounded-full opacity-55 blur-lg"
                      style={{
                        background: `radial-gradient(50% 55% at 50% 50%, ${color}, transparent 72%)`,
                      }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative grid h-8 w-12 place-items-center rounded-full transition-all duration-300',
                      !isActive && 'group-hover:bg-surface-2',
                    )}
                    style={
                      isActive
                        ? {
                            backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
                            boxShadow: `0 0 20px ${color}38`,
                          }
                        : undefined
                    }
                  >
                    <Icon
                      className={cn(
                        'h-[21px] w-[21px] transition-all duration-300',
                        isActive
                          ? 'scale-105 drop-shadow-[0_0_5px_var(--nav-tint)]'
                          : 'group-active:scale-95',
                      )}
                    />
                  </span>
                </span>
                <span className={cn('relative transition-colors', isActive && 'font-semibold')}>
                  {t(labelKey)}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
