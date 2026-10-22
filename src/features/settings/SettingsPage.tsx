import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useI18n } from '../../app/i18n'
import { useAppState } from '../../app/state'
import { CURRENCY_CODES, type AccentId, type ChartStyle, type CurrencyCode, type ThemeMode } from '../../types'
import { ACCENT_OPTIONS } from '../../theme/accents'
import { getStateSize } from '../../storage/localStore'
import {
  BackupError,
  MAX_BACKUP_BYTES,
  parseBackupText,
  type BackupErrorCode,
  type BackupPreview,
} from '../backup/backupFormat'
import { downloadExport } from '../export/exportText'
import { APP_VERSION } from '../../lib/appVersion'
import { cn } from '../../lib/cn'
import type { TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeader } from '../../components/ui/Card'
import { Field, Select } from '../../components/ui/Field'
import {
  AlertTriangleIcon,
  BarChartIcon,
  CheckIcon,
  DeviceIcon,
  DownloadIcon,
  GaugeIcon,
  LayersIcon,
  MoonIcon,
  PieChartIcon,
  RotateIcon,
  ShieldIcon,
  SlidersIcon,
  SparklesIcon,
  SunIcon,
  UploadIcon,
} from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

type ImportViewError = BackupErrorCode | 'read'

const IMPORT_ERROR_KEY: Record<ImportViewError, TranslationKey> = {
  empty: 'settings.importErrorEmpty',
  tooLarge: 'settings.importErrorTooLarge',
  notBackup: 'settings.importErrorNotBackup',
  unsupported: 'settings.importErrorUnsupported',
  checksum: 'settings.importErrorChecksum',
  corrupt: 'settings.importErrorCorrupt',
  schema: 'settings.importErrorSchema',
  read: 'settings.importErrorRead',
}

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
interface ImportSummary {
  categories: number
  goals: number
  months: number
}

export function SettingsPage() {
  const {
    state,
    savedAt,
    setLocale,
    setCurrency,
    setAccent,
    setThemeMode,
    setChartStyle,
    resetData,
    replaceState,
    replayOnboarding,
  } = useAppState()
  const i18n = useI18n()
  const { t, locale, currency, currencyName, formatDateTime, formatMoney } = i18n

  const [confirmReset, setConfirmReset] = useState(false)
  const [promptEvent, install] = useInstallPrompt()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [preview, setPreview] = useState<BackupPreview | null>(null)
  const [importFileName, setImportFileName] = useState('')
  const [importError, setImportError] = useState<ImportViewError | null>(null)
  const [importSuccess, setImportSuccess] = useState<ImportSummary | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  const sizeBytes = getStateSize(state)
  const sizeText =
    sizeBytes < 1024
      ? `${sizeBytes} B`
      : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(sizeBytes / 1024)} KB`

  const handleExport = async () => {
    setExporting(true)
    setExportError(false)
    try {
      await downloadExport(state, i18n)
    } catch (error) {
      console.warn('No se pudo generar el respaldo', error)
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    setImportSuccess(null)
    setImportError(null)
    setPreview(null)
    setImportFileName(file.name)

    if (file.size > MAX_BACKUP_BYTES) {
      setImportError('tooLarge')
      return
    }

    setReading(true)
    try {
      const text = await file.text()
      const parsed = await parseBackupText(text)
      setPreview(parsed)
    } catch (error) {
      setImportError(error instanceof BackupError ? error.code : 'read')
    } finally {
      setReading(false)
    }
  }

  const confirmImport = () => {
    if (!preview) return
    const summary: ImportSummary = {
      categories: preview.state.categories.length,
      goals: preview.state.goals.length,
      months: preview.state.budgets.length,
    }
    replaceState(preview.state)
    setPreview(null)
    setImportError(null)
    setImportSuccess(summary)
  }

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

        <div className="rounded-2xl border border-warning/35 bg-warning-soft/55 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-on-warning-soft">
            <AlertTriangleIcon className="h-4.5 w-4.5" />
            {t('settings.storageWarningTitle')}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {t('settings.storageWarning')}
          </p>
        </div>

        {importSuccess ? (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-2xl border border-success/30 bg-success-soft p-4 text-on-success-soft"
          >
            <CheckIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            <p className="text-sm leading-relaxed">
              {t('settings.importSuccess', {
                categories: importSuccess.categories,
                goals: importSuccess.goals,
                months: importSuccess.months,
              })}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <p className="text-sm font-semibold text-text">{t('settings.exportTitle')}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t('settings.exportHint')}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
              <ShieldIcon className="h-3.5 w-3.5 text-success" />
              {t('settings.exportFormat')}
            </p>
            <Button
              className="mt-3"
              icon={<DownloadIcon className="h-4 w-4" />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? t('settings.exportWorking') : t('settings.exportAction')}
            </Button>
            {exportError ? (
              <p role="alert" className="mt-2 text-xs font-medium text-danger">
                {t('settings.exportError')}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-sm font-semibold text-text">{t('settings.importTitle')}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t('settings.importHint')}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
              <ShieldIcon className="h-3.5 w-3.5 text-success" />
              {t('settings.importSignatureHint')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              className="sr-only"
              onChange={handleFile}
            />
            <Button
              className="mt-3"
              variant="secondary"
              icon={<UploadIcon className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
              disabled={reading}
            >
              {reading ? t('settings.importReading') : t('settings.importAction')}
            </Button>
          </div>
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

        <div className="rounded-2xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <RotateIcon className="h-4 w-4 text-primary-strong" />
            {t('settings.onboardingTitle')}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t('settings.onboardingHint')}
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            icon={<SparklesIcon className="h-4 w-4" />}
            onClick={replayOnboarding}
          >
            {t('settings.onboardingAction')}
          </Button>
        </div>

        <p className="border-t border-border pt-3 text-xs text-muted">
          {t('settings.version')} {APP_VERSION} · {t('common.appName')}
        </p>
      </Card>

      {preview ? (
        <Modal
          open
          onClose={() => setPreview(null)}
          title={t('settings.importPreviewTitle')}
          description={importFileName}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPreview(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={confirmImport} icon={<CheckIcon className="h-4 w-4" />}>
                {t('settings.importConfirm')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-2 p-3.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{t('settings.importGenerated')}</span>
                <span className="font-medium text-text">
                  {formatDateTime(preview.exportedAt)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-muted">{t('settings.version')}</span>
                <span className="font-medium text-text">v{preview.appVersion}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                {t('settings.importContents')}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border p-2.5 text-center">
                  <p className="figure text-sm font-semibold text-text">
                    {preview.state.categories.length}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted">
                    {t('settings.importCategories', {
                      count: preview.state.categories.length,
                    })}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-2.5 text-center">
                  <p className="figure text-sm font-semibold text-text">
                    {preview.state.goals.length}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted">
                    {t('settings.importGoals', { count: preview.state.goals.length })}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-2.5 text-center">
                  <p className="figure text-sm font-semibold text-text">
                    {preview.state.budgets.length}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted">
                    {t('settings.importMonths', { count: preview.state.budgets.length })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3.5 text-sm">
              <span className="text-muted">{t('settings.importIncome')}</span>
              <span className="figure font-semibold text-text">
                {formatMoney(preview.state.income.netAmount)}
              </span>
            </div>

            <p className="flex items-start gap-2 rounded-2xl border border-success/30 bg-success-soft p-3 text-xs leading-relaxed text-on-success-soft">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {t('settings.importSignature')}
            </p>

            <p className="rounded-2xl border border-danger/30 bg-danger-soft/55 p-3 text-xs leading-relaxed text-on-danger-soft">
              {t('settings.importReplaceWarning')}
            </p>
          </div>
        </Modal>
      ) : null}

      {importError ? (
        <Modal
          open
          onClose={() => setImportError(null)}
          size="sm"
          title={t('settings.importErrorTitle')}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setImportError(null)}>
                {t('common.close')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setImportError(null)
                  window.setTimeout(() => fileInputRef.current?.click(), 0)
                }}
              >
                {t('settings.importTryAgain')}
              </Button>
            </div>
          }
        >
          <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft/55 p-4 text-on-danger-soft">
            <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-relaxed">{t(IMPORT_ERROR_KEY[importError])}</p>
          </div>
        </Modal>
      ) : null}

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
