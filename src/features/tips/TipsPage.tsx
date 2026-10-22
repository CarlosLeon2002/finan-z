import { useI18n } from '../../app/i18n'
import { pickText, quoteOfTheDay, tipOfTheDay, TIPS } from '../../domain/tips'
import { Card, SectionHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Feedback'
import { BulbIcon, TrendingUpIcon } from '../../components/ui/Icon'

/** Consejos diarios: recomendación del día, frase de referencia y archivo. */
export function TipsPage() {
  const { t, locale, formatNumber } = useI18n()
  const tip = tipOfTheDay()
  const quote = quoteOfTheDay()

  return (
    <div className="animate-fade-up space-y-6">
      <SectionHeader
        title={t('tips.title')}
        description={t('tips.subtitle')}
        action={<Badge tone="neutral">{t('tips.renews')}</Badge>}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden p-6">
          <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-warning/15" />
          <div className="flex items-center gap-2 text-on-warning-soft">
            <BulbIcon className="h-5 w-5" />
            <h3 className="text-sm font-semibold">{t('tips.tipOfDay')}</h3>
          </div>
          <p className="relative mt-4 text-base leading-relaxed text-text">
            {pickText(tip.text, locale)}
          </p>
        </Card>

        <Card className="relative overflow-hidden p-6">
          <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15" />
          <div className="flex items-center gap-2 text-on-primary-soft">
            <TrendingUpIcon className="h-5 w-5" />
            <h3 className="text-sm font-semibold">{t('tips.quoteOfDay')}</h3>
          </div>
          <p className="relative mt-4 text-lg italic leading-relaxed text-text">
            “{pickText(quote.text, locale)}”
          </p>
          <p className="relative mt-3 text-sm font-semibold text-muted">— {quote.author}</p>
        </Card>
      </section>

      <div>
        <SectionHeader
          title={t('tips.allTips')}
          description={t('tips.tipsCount', { count: formatNumber(TIPS.length) })}
        />
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {TIPS.map((item, index) => (
            <li key={item.id} className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-xs font-semibold text-primary-strong">
                {formatNumber(index + 1)}
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {pickText(item.text, locale)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
