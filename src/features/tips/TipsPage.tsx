import { useEffect, useState } from 'react'
import { useI18n } from '../../app/i18n'
import { pickText, quoteOfTheDay, tipOfTheDay, TIPS, type TipTheme } from '../../domain/tips'
import type { TranslationKey } from '../../i18n/types'
import { Badge } from '../../components/ui/Feedback'
import { BulbIcon, CalendarIcon, SparklesIcon, TrendingUpIcon } from '../../components/ui/Icon'

const THEME_KEY: Record<TipTheme, TranslationKey> = {
  mindset: 'tips.themes.mindset',
  habits: 'tips.themes.habits',
  budget: 'tips.themes.budget',
  saving: 'tips.themes.saving',
  debt: 'tips.themes.debt',
  investing: 'tips.themes.investing',
  income: 'tips.themes.income',
  protection: 'tips.themes.protection',
  giving: 'tips.themes.giving',
}

/** Reloj lento: solo se actualiza cada minuto para el contador de medianoche. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function untilMidnight(now: Date, locale: string): string {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const minutes = Math.max(0, Math.round((midnight.getTime() - now.getTime()) / 60_000))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return locale === 'en-US' ? `${hours}h ${rest}m` : `${hours} h ${rest} min`
}

/**
 * Pantalla del consejo diario: una sola idea, una frase y un paso concreto.
 * Todo cabe sin scroll en un móvil típico; no hay archivo ni listas largas.
 */
export function TipsPage() {
  const { t, locale, formatDate } = useI18n()
  const now = useNow()
  const tip = tipOfTheDay(now)
  const quote = quoteOfTheDay(now)

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-13.5rem)] w-full max-w-4xl flex-col justify-center md:min-h-[calc(100dvh-14.5rem)]">
      <section aria-labelledby="daily-tip-title" className="animate-fade-up space-y-3">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-strong">
              {t('tips.title')}
            </p>
            <h1
              id="daily-tip-title"
              className="mt-1 font-heading text-xl font-semibold tracking-tight text-text sm:text-2xl"
            >
              {t('tips.today', { date: formatDate(now) })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="primary">{t('tips.onePerDay')}</Badge>
            <Badge tone="neutral">
              <CalendarIcon className="h-3.5 w-3.5" />
              {t('tips.renews')}
            </Badge>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-[1.35fr_0.65fr] md:items-stretch">
          {/* Consejo del día */}
          <article className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-warning/25 bg-surface p-4 shadow-[0_24px_60px_-42px_rgba(10,14,26,0.55)] sm:p-6">
            <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-warning/15 blur-2xl" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1 select-none font-heading text-[7rem] leading-none text-warning/10"
            >
              “
            </span>

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-on-warning-soft">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-warning-soft">
                  <BulbIcon className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                  {t('tips.tipOfDay')}
                </span>
              </div>
              <Badge tone="warning">{t(THEME_KEY[tip.theme])}</Badge>
            </div>

            <p className="relative mt-4 font-heading text-[clamp(1.18rem,2.7vw,1.55rem)] font-medium leading-[1.35] tracking-tight text-text">
              {pickText(tip.text, locale)}
            </p>

            <p className="relative mt-auto pt-3 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-text">{t('tips.source')}:</span>{' '}
              {pickText(tip.source, locale)}
            </p>

            <div className="relative mt-3 flex items-start gap-2.5 rounded-2xl border border-dashed border-warning/35 bg-warning-soft/40 px-3.5 py-2.5">
              <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-on-warning-soft" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-on-warning-soft">{t('tips.applyTitle')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{t('tips.applyBody')}</p>
              </div>
            </div>
          </article>

          {/* Frase y rotación */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <article className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-primary/20 bg-surface p-4 sm:p-5">
              <span className="pointer-events-none absolute -right-12 -bottom-14 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative flex items-center gap-2 text-on-primary-soft">
                <TrendingUpIcon className="h-4.5 w-4.5" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                  {t('tips.quoteOfDay')}
                </span>
              </div>
              <blockquote className="relative mt-3 flex-1 font-heading text-sm italic leading-relaxed text-text sm:text-base">
                “{pickText(quote.text, locale)}”
              </blockquote>
              <p className="relative mt-3 text-xs font-semibold text-muted">— {quote.author}</p>
            </article>

            <article className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-border bg-surface-2/70 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                  {t('tips.ideas', { count: TIPS.length })}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-text">
                  {t('tips.nextIn', { time: untilMidnight(now, locale) })}
                </p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-on-primary-soft">
                <SparklesIcon className="h-4.5 w-4.5" />
              </span>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
