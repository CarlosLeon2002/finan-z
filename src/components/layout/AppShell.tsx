import type { ComponentType, ReactNode, SVGProps } from 'react'
import { useAppState } from '../../app/state'
import { useI18n } from '../../app/i18n'
import { useRoute, type Route } from '../../app/router'
import { cn } from '../../lib/cn'
import type { TranslationKey } from '../../i18n/types'
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
}

const NAV_ITEMS: NavItem[] = [
  { route: 'home', labelKey: 'nav.home', Icon: HomeIcon },
  { route: 'savings', labelKey: 'nav.savings', Icon: WalletIcon },
  { route: 'partition', labelKey: 'nav.partition', Icon: PieChartIcon },
  { route: 'tips', labelKey: 'nav.tips', Icon: BulbIcon },
  { route: 'settings', labelKey: 'nav.settings', Icon: SlidersIcon },
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

  // Botón rápido de idioma en la cabecera (los detalles viven en Ajustes).
  const toggleLocale = () => setLocale(locale === 'es-419' ? 'en-US' : 'es-419')

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/30">
              $
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-text">
                {t('common.appName')}
              </span>
              <span className="hidden text-xs text-muted sm:block">{t('common.tagline')}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={toggleLocale}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 text-sm font-medium text-muted transition hover:text-text"
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
          {NAV_ITEMS.map(({ route: target, labelKey, Icon }) => {
            const isActive = route === target
            return (
              <button
                key={target}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => navigate(target)}
                className={cn(
                  'group relative flex flex-1 flex-col items-center gap-0.5 rounded-[1.05rem] px-1 pb-1 pt-1.5 text-[10px] font-medium transition-colors duration-200 sm:text-[11px]',
                  isActive ? 'text-primary-strong' : 'text-muted hover:text-text',
                )}
              >
                <span
                  className={cn(
                    'grid h-8 w-12 place-items-center rounded-full transition-all duration-300',
                    isActive
                      ? 'bg-primary-soft shadow-sm shadow-primary/20'
                      : 'group-hover:bg-surface-2',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[21px] w-[21px] transition-transform duration-300',
                      isActive ? 'scale-105' : 'group-active:scale-95',
                    )}
                  />
                </span>
                <span className={cn('transition-colors', isActive && 'font-semibold')}>
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
