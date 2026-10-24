import { useState } from 'react'
import { useAppState } from '../../app/state'
import { cn } from '../../lib/cn'
import { BrandMark } from '../../components/brand/BrandLogo'
import { Button } from '../../components/ui/Button'
import { GlobeIcon, ShieldIcon } from '../../components/ui/Icon'
import type { Locale } from '../../types'

const OPTIONS: { value: Locale; label: string; flag: string; subtitle: string }[] = [
  { value: 'es-419', label: 'Español', flag: '🌎', subtitle: 'Hispanoamericano' },
  { value: 'en-US', label: 'English', flag: '🇺🇸', subtitle: 'United States' },
]

/**
 * Pantalla inicial: elección de idioma antes de ver ningún dato.
 * Se muestra solo la primera vez (cuando `settings.locale` sigue en `null`).
 */
export function LanguageGate() {
  const { setLocale } = useAppState()
  const [selected, setSelected] = useState<Locale>('es-419')

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="mb-8 text-center">
          <BrandMark className="mx-auto h-16 w-16 drop-shadow-[0_10px_24px_rgba(15,122,85,0.28)]" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text">
            <span className="text-gradient">Finan-Z</span>
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Organiza tu ingreso, reparte tus gastos y avanza hacia tus metas. Un consejo nuevo
            cada día, y todo guardado solo en este dispositivo.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="mb-3 w-full text-center text-sm font-medium text-muted">
            Elige tu idioma / Choose your language
          </legend>

          {OPTIONS.map((option) => {
            const isActive = selected === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelected(option.value)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                  isActive
                    ? 'border-primary bg-primary-soft/60 ring-1 ring-primary'
                    : 'border-border bg-surface hover:border-primary/40',
                )}
              >
                <span className="text-2xl">{option.flag}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-text">{option.label}</span>
                  <span className="block text-xs text-muted">{option.subtitle}</span>
                </span>
                <GlobeIcon
                  className={cn('h-5 w-5', isActive ? 'text-primary-strong' : 'text-muted')}
                />
              </button>
            )
          })}
        </fieldset>

        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => setLocale(selected)}
        >
          Comenzar / Get started
        </Button>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <ShieldIcon className="h-4 w-4 shrink-0" />
          Sin cuentas, sin nube: tus datos se quedan aquí, contigo.
        </p>
      </div>
    </div>
  )
}
