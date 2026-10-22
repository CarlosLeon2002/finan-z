import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { CURRENCY_CODES, type AccentId, type ChartStyle, type CurrencyCode, type ThemeMode } from '../../types'
import { ACCENT_OPTIONS } from '../../theme/accents'
import { getStateSize } from '../../storage/localStore'
import { downloadExport } from '../export/exportText'
import { cn } from '../../lib/cn'
import type { TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeader } from '../../components/ui/Card'
import { Field, Select } from '../../components/ui/Field'
import {
  BarChartIcon,
  CheckIcon,
  DeviceIcon,
  DownloadIcon,
  GaugeIcon,
  LayersIcon,
  MoonIcon,
  PieChartIcon,
  ShieldIcon,
  SlidersIcon,
  SunIcon,
} from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

const APP_VERSION = '1.0.0'

/** Nombre traducido de cada preset de acento. */
const ACCENT_LABEL: Record<AccentId, TranslationKey> = {
  indigo: 'settings.accentIndigo',
  vrock: 'settings.accentVrock',
  ocean: 'settings.accentOcean',
  emerald: 'settings.accentEmerald',
  violet: 'settings.accentViolet',
  amber: 'settings.accentAmber',
  rose: 'settings.accentRose',
  graphite: 'settings.accentGraphite',
}

/** Cada estilo de gráfica: icono, etiqueta y descripción corta. */
const CHART_META: Record<
  ChartStyle,
  { icon: ReactNode; label: TranslationKey; desc: TranslationKey }
> = {
  donut: {
    icon: <PieChartIcon className="h-5 w-5" />,
    label: 'settings.chartDonut',
    desc: 'settings.chartDonutDesc',
  },
  ranking: {
    icon: <BarChartIcon className="h-5 w-5" />,
    label: 'settings.chartRanking',
    desc: 'settings.chartRankingDesc',
  },
  gauge: {
    icon: <GaugeIcon className="h-5 w-5" />,
    label: 'settings.chartGauge',
    desc: 'settings.chartGaugeDesc',
  },
  stacked: {
    icon: <LayersIcon className="h-5 w-5" />,
    label: 'settings.chartStacked',
    desc: 'settings.chartStackedDesc',
  },
}

/** Tarjetas para elegir el estilo de la gráfica principal. */
function ChartStylePicker({
  value,
  onChange,
  label,
}: {
  value: ChartStyle
  onChange: (style: ChartStyle) => void
  label: string
}) {
  const { t } = useI18n()
  const styles: ChartStyle[] = ['donut', 'ranking', 'gauge', 'stacked']
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {styles.map((style) => {
        const meta = CHART_META[style]
        const isActive = style === value
        return (
          <button
            key={style}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(style)}
            className={cn(
              'flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-all',
              isActive
                ? 'border-primary bg-primary-soft'
                : 'border-border hover:border-primary/40 hover:bg-surface-2',
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span className={isActive ? 'text-on-primary-soft' : 'text-muted'}>
                {meta.icon}
              </span>
              {isActive ? <CheckIcon className="h-4 w-4 text-on-primary-soft" /> : null}
            </span>
            <span
              className={cn(
                'text-sm font-medium leading-tight',
                isActive ? 'text-on-primary-soft' : 'text-text',
              )}
            >
              {t(meta.label)}
            </span>
            <span className="text-[11px] leading-tight text-muted">{t(meta.desc)}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Muestras de color para elegir el acento; el activo muestra un check. */
function AccentPicker({
  value,
  onChange,
  label,
}: {
  value: AccentId
  onChange: (accent: AccentId) => void
  label: string
}) {
  const { t } = useI18n()
  return (
    <div role="group" aria-label={label} className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {ACCENT_OPTIONS.map((option) => {
        const isActive = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            aria-label={t(ACCENT_LABEL[option.id])}
            title={t(ACCENT_LABEL[option.id])}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex min-w-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-all',
              isActive
                ? 'border-primary bg-primary-soft'
                : 'border-border hover:border-primary/40',
            )}
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-full text-white"
              style={{ backgroundColor: option.swatch }}
            >
              {isActive ? <CheckIcon className="h-4 w-4" /> : null}
            </span>
            <span
              className={cn(
                'w-full truncate text-center text-[10px] leading-tight',
                isActive ? 'font-semibold text-on-primary-soft' : 'text-muted',
              )}
            >
              {t(ACCENT_LABEL[option.id])}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Evento de instalación que emite el navegador (PWA). */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function useInstallPrompt(): [InstallPromptEvent | null, () => void] {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = () => {
    if (!promptEvent) return
    void promptEvent.prompt()
    setPromptEvent(null)
  }

  return [promptEvent, install]
}

/** Preferencias (idioma/moneda), datos locales, exportación e instalación. */
export function SettingsPage() {
  const { state, savedAt, setLocale, setCurrency, setAccent, setThemeMode, setChartStyle, resetData } =
    useAppState()
  const i18n = useI18n()
  const { t, locale, currency, currencyName, formatDateTime } = i18n

  const [confirmReset, setConfirmReset] = useState(false)
  const [promptEvent, install] = useInstallPrompt()

  const sizeBytes = getStateSize(state)
  const sizeText =
    sizeBytes < 1024
      ? `${sizeBytes} B`
      : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(sizeBytes / 1024)} KB`

  const handleExport = () => downloadExport(state, i18n)

  return (
    <div className="animate-fade-up max-w-3xl space-y-4">
      <SectionHeader title={t('settings.title')} description={t('settings.subtitle')} />

      {/* Interfaz */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <SlidersIcon className="h-4.5 w-4.5 text-muted" />
          <h3 className="text-sm font-semibold text-text">{t('settings.sectionInterface')}</h3>
        </div>

        <Field label={t('settings.language')} hint={t('settings.languageHint')}>
          <SegmentedControl
            ariaLabel={t('settings.language')}
            value={locale}
            onChange={(value) => setLocale(value)}
            options={[
              { value: 'es-419', label: t('gate.languageEs') },
              { value: 'en-US', label: t('gate.languageEn') },
            ]}
          />
        </Field>

        <Field label={t('settings.currency')} htmlFor="currency" hint={t('settings.currencyHint')}>
          <Select
            id="currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {code} — {currencyName(code)}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {/* Apariencia */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <SunIcon className="h-4.5 w-4.5 text-muted" />
          <h3 className="text-sm font-semibold text-text">{t('settings.sectionAppearance')}</h3>
        </div>

        <Field label={t('settings.themeMode')} hint={t('settings.themeModeHint')}>
          <SegmentedControl<ThemeMode>
            ariaLabel={t('settings.themeMode')}
            value={state.settings.themeMode}
            onChange={setThemeMode}
            options={[
              {
                value: 'auto',
                label: t('settings.themeAuto'),
                icon: <DeviceIcon className="h-4 w-4" />,
              },
              {
                value: 'light',
                label: t('settings.themeLight'),
                icon: <SunIcon className="h-4 w-4" />,
              },
              {
                value: 'dark',
                label: t('settings.themeDark'),
                icon: <MoonIcon className="h-4 w-4" />,
              },
            ]}
          />
        </Field>

        <Field label={t('settings.accent')} hint={t('settings.accentHint')}>
          <AccentPicker
            label={t('settings.accent')}
            value={state.settings.accent}
            onChange={setAccent}
          />
        </Field>
      </Card>

      {/* Visualizaciones */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <BarChartIcon className="h-4.5 w-4.5 text-muted" />
          <h3 className="text-sm font-semibold text-text">{t('settings.sectionCharts')}</h3>
        </div>

        <Field label={t('settings.chartStyle')} hint={t('settings.chartStyleHint')}>
          <ChartStylePicker
            label={t('settings.chartStyle')}
            value={state.settings.chartStyle}
            onChange={setChartStyle}
          />
        </Field>
      </Card>

      {/* Datos locales */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-4.5 w-4.5 text-success" />
          <h3 className="text-sm font-semibold text-text">{t('settings.storage')}</h3>
        </div>
        <p className="-mt-1 text-sm leading-relaxed text-muted">{t('settings.storageHint')}</p>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-2 p-3.5">
            <dt className="text-xs text-muted">{t('settings.storageUsed')}</dt>
            <dd className="mt-1 text-sm font-semibold text-text">{sizeText}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 p-3.5">
            <dt className="text-xs text-muted">{t('settings.lastSaved')}</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-text">
              {savedAt ? formatDateTime(savedAt) : t('settings.neverSaved')}
            </dd>
          </div>
        </dl>

        <div className="rounded-2xl border border-border p-4">
          <p className="text-sm font-semibold text-text">{t('settings.exportTitle')}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{t('settings.exportHint')}</p>
          <Button
            className="mt-3"
            icon={<DownloadIcon className="h-4 w-4" />}
            onClick={handleExport}
          >
            {t('settings.exportAction')}
          </Button>
        </div>

        <div className="rounded-2xl border border-danger/30 bg-danger-soft/50 p-4">
          <p className="text-sm font-semibold text-on-danger-soft">{t('settings.resetTitle')}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-danger-soft/80">
            {t('settings.resetHint')}
          </p>
          <Button variant="danger" className="mt-3" onClick={() => setConfirmReset(true)}>
            {t('settings.resetAction')}
          </Button>
        </div>
      </Card>

      {/* Aplicación */}
      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-semibold text-text">{t('settings.sectionApp')}</h3>

        {promptEvent ? (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/50 p-4">
            <p className="text-sm font-semibold text-text">{t('settings.installTitle')}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t('settings.installHint')}</p>
            <Button className="mt-3" onClick={install}>
              {t('settings.installAction')}
            </Button>
          </div>
        ) : null}

        <div className="flex items-start gap-3 text-sm leading-relaxed text-muted">
          <ShieldIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
          <p>
            <span className="font-medium text-text">{t('settings.privacy')}:</span>{' '}
            {t('settings.privacyText')}
          </p>
        </div>

        <p className="border-t border-border pt-3 text-xs text-muted">
          {t('settings.version')} {APP_VERSION} · {t('common.appName')}
        </p>
      </Card>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title={t('settings.resetTitle')}
        description={t('settings.resetConfirm')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetData()
                setConfirmReset(false)
              }}
            >
              {t('settings.resetAction')}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">{t('settings.resetHint')}</p>
      </Modal>
    </div>
  )
}
