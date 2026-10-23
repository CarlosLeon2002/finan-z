import { useI18n } from '../../app/i18n'
import { findMethod } from '../../domain/methods'
import type { AlertScope, AlertTone, SmartAlert } from '../../domain/insights'
import { cn } from '../../lib/cn'
import { ArrowRightIcon, AlertTriangleIcon, InfoIcon, SparklesIcon } from '../ui/Icon'

const TONE_CLASS: Record<AlertTone, string> = {
  danger: 'border-danger/35 bg-danger-soft/65 text-on-danger-soft',
  warning: 'border-warning/35 bg-warning-soft/65 text-on-warning-soft',
  info: 'border-primary/25 bg-primary-soft/55 text-on-primary-soft',
}

const TONE_ICON: Record<AlertTone, typeof InfoIcon> = {
  danger: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
}

interface SmartAlertsProps {
  alerts: SmartAlert[]
  /** Filtra por ámbito (Panel muestra todo). */
  scope?: AlertScope | 'all'
  limit?: number
  onNavigate?: (route: 'partition' | 'savings') => void
  className?: string
}

/**
 * Alertas en vivo + métodos alternativos. Se alimenta del motor de dominio,
 * así que reacciona al mismo render en que cambia un monto o un aporte.
 */
export function SmartAlerts({
  alerts,
  scope = 'all',
  limit = 2,
  onNavigate,
  className,
}: SmartAlertsProps) {
  const { t } = useI18n()
  const visible = alerts
    .filter((alert) => scope === 'all' || alert.scope === scope)
    .slice(0, limit)

  if (visible.length === 0) return null

  return (
    <div className={cn('space-y-2.5', className)}>
      {visible.map((alert) => {
        const Icon = TONE_ICON[alert.tone]
        const methods = alert.methodIds.map((id) => findMethod(id)).slice(0, 2)

        return (
          <div
            key={alert.id}
            role="status"
            className={cn('rounded-2xl border px-4 py-3', TONE_CLASS[alert.tone])}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t(alert.titleKey, alert.vars)}</p>
                <p className="mt-0.5 text-xs leading-relaxed opacity-90">
                  {t(alert.bodyKey, alert.vars)}
                </p>

                {methods.length > 0 ? (
                  <div className="mt-2.5 rounded-xl border border-current/15 bg-surface/55 p-2.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-80">
                      <SparklesIcon className="h-3.5 w-3.5" />
                      {t('alerts.recommend')}
                    </p>
                    <ul className="mt-1.5 space-y-1.5">
                      {methods.map((method) => (
                        <li key={method.id}>
                          <p className="text-xs font-semibold text-text">{t(method.titleKey)}</p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
                            {t(method.summaryKey)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {alert.action && onNavigate ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(alert.action as 'partition' | 'savings')}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"
                  >
                    {alert.action === 'partition'
                      ? t('alerts.goToPartition')
                      : t('alerts.goToSavings')}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
