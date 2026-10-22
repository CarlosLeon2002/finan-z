import { useState } from 'react'
import { useAppState } from '../../app/state'
import { useI18n } from '../../app/i18n'
import { APP_VERSION } from '../../lib/appVersion'
import { cn } from '../../lib/cn'
import type { TFunction, TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import {
  BookIcon,
  CheckIcon,
  HeartIcon,
  PieChartIcon,
  ShieldIcon,
  SparklesIcon,
  TargetIcon,
  WalletIcon,
} from '../../components/ui/Icon'

interface Step {
  titleKey: TranslationKey
  bodyKey: TranslationKey
  bullets: TranslationKey[]
}

const STEPS: Step[] = [
  {
    titleKey: 'onboarding.welcomeTitle',
    bodyKey: 'onboarding.welcomeBody',
    bullets: ['onboarding.welcomeBullet1', 'onboarding.welcomeBullet2'],
  },
  {
    titleKey: 'onboarding.splitTitle',
    bodyKey: 'onboarding.splitBody',
    bullets: ['onboarding.splitBullet1', 'onboarding.splitBullet2'],
  },
  {
    titleKey: 'onboarding.goalsTitle',
    bodyKey: 'onboarding.goalsBody',
    bullets: ['onboarding.goalsBullet1', 'onboarding.goalsBullet2'],
  },
  {
    titleKey: 'onboarding.tipsTitle',
    bodyKey: 'onboarding.tipsBody',
    bullets: ['onboarding.tipsBullet1', 'onboarding.tipsBullet2'],
  },
  {
    titleKey: 'onboarding.storageTitle',
    bodyKey: 'onboarding.storageBody',
    bullets: ['onboarding.storageBullet1', 'onboarding.storageBullet2'],
  },
]

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/30">
        $
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-text">Finan-Z</span>
        <span className="block text-[11px] text-muted">v{APP_VERSION}</span>
      </span>
    </span>
  )
}

interface VisualProps {
  t: TFunction
  money: (value: number) => string
}

function WelcomeVisual({ t, money }: VisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-border bg-surface p-4 shadow-xl shadow-primary/10">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-strong p-4 text-white">
          <p className="text-xs font-medium text-white/75">{t('onboarding.mockAvailable')}</p>
          <p className="figure mt-1 text-3xl font-semibold tracking-tight">{money(1240)}</p>
          <div className="mt-3 flex gap-1.5">
            <span className="h-1.5 flex-1 rounded-full bg-white/90" />
            <span className="h-1.5 flex-1 rounded-full bg-white/70" />
            <span className="h-1.5 flex-1 rounded-full bg-white/40" />
            <span className="h-1.5 flex-1 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            {
              label: 'onboarding.mockHome',
              amount: 620,
              tone: 'from-indigo-400/30 to-indigo-500/10',
            },
            {
              label: 'onboarding.mockFood',
              amount: 310,
              tone: 'from-emerald-400/30 to-emerald-500/10',
            },
            {
              label: 'onboarding.mockGoals',
              amount: 310,
              tone: 'from-amber-400/30 to-amber-500/10',
            },
          ].map((row) => (
            <div
              key={row.label}
              className={cn(
                'rounded-xl border border-border bg-gradient-to-br p-2.5',
                row.tone,
              )}
            >
              <p className="text-[10px] text-muted">
                {t(row.label as TranslationKey)}
              </p>
              <p className="figure mt-0.5 text-xs font-semibold text-text">
                {money(row.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SplitVisual({ t }: VisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-warning/10 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-border bg-surface p-5 shadow-xl shadow-warning/10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {t('onboarding.mockSplit')}
          </p>
          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-semibold text-on-warning-soft">
            {t('onboarding.mockAssigned')}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-5">
          <div
            className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
            style={{
              background:
                'conic-gradient(var(--color-primary) 0 42%, var(--color-success) 42% 70%, var(--color-warning) 70% 88%, var(--color-surface-2) 88% 100%)',
            }}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-surface">
              <PieChartIcon className="h-6 w-6 text-primary-strong" />
            </span>
          </div>
          <ul className="min-w-0 flex-1 space-y-2">
            {[
              { label: 'onboarding.mockHome', value: '42 %', tone: 'bg-primary' },
              { label: 'onboarding.mockFood', value: '28 %', tone: 'bg-success' },
              { label: 'onboarding.mockTransport', value: '18 %', tone: 'bg-warning' },
              {
                label: 'onboarding.mockLeisure',
                value: '12 %',
                tone: 'bg-surface-2 ring-1 ring-border',
              },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-2 text-xs">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', row.tone)} />
                <span className="flex-1 truncate text-muted">
                  {t(row.label as TranslationKey)}
                </span>
                <span className="figure font-semibold text-text">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[11px] text-muted">
          <SparklesIcon className="h-3.5 w-3.5 text-primary-strong" />
          <span>{t('onboarding.mockLive')}</span>
        </div>
      </div>
    </div>
  )
}

function GoalVisual({ t, money }: VisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-success/10 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-border bg-surface p-5 shadow-xl shadow-success/10">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-text">
            <TargetIcon className="h-4 w-4 text-success" />
            {t('onboarding.mockTrip')}
          </span>
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-semibold text-on-success-soft">
            72 %
          </span>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full bg-surface-2">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(var(--color-success) 0 72%, var(--color-surface-2) 72% 100%)',
              }}
            />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-surface text-lg font-semibold text-success">
              72%
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="figure text-xl font-semibold text-text">{money(1440)}</p>
            <p className="text-xs text-muted">
              {t('onboarding.mockOfTarget', { amount: money(2000) })}
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <CheckIcon className="h-3.5 w-3.5 text-success" />
                {t('onboarding.mockSuggested', { amount: money(56) })}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <HeartIcon className="h-3.5 w-3.5 text-primary-strong" />
                {t('onboarding.mockCelebrate')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TipVisual({ t }: VisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-xl shadow-primary/10">
        <span className="pointer-events-none absolute -right-6 -top-8 select-none font-heading text-[7rem] leading-none text-primary/10">
          “
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-semibold text-on-warning-soft">
          <BookIcon className="h-3.5 w-3.5" />
          {t('onboarding.mockHabits')}
        </span>
        <p className="relative mt-3 font-heading text-lg leading-snug text-text">
          {t('onboarding.mockTip')}
        </p>
        <p className="mt-3 text-xs text-muted">{t('onboarding.mockTipSource')}</p>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-2/70 px-3 py-2 text-[11px] text-muted">
          {t('onboarding.mockOneIdea')}
        </div>
      </div>
    </div>
  )
}

function StorageVisual({ t }: VisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-warning/10 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-border bg-surface p-5 shadow-xl shadow-warning/10">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-strong">
            <ShieldIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-text">{t('onboarding.mockLocal')}</p>
            <p className="text-xs text-muted">{t('onboarding.mockLocalSub')}</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-warning/30 bg-warning-soft/60 p-3.5">
          <p className="text-xs font-semibold text-on-warning-soft">
            {t('onboarding.mockBackup')}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {t('onboarding.mockBackupHint')}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[11px] text-muted">
          <WalletIcon className="h-3.5 w-3.5 text-success" />
          {t('onboarding.mockStoragePath')}
        </div>
      </div>
    </div>
  )
}

function StepVisual({ index, t, money }: VisualProps & { index: number }) {
  switch (index) {
    case 0:
      return <WelcomeVisual t={t} money={money} />
    case 1:
      return <SplitVisual t={t} money={money} />
    case 2:
      return <GoalVisual t={t} money={money} />
    case 3:
      return <TipVisual t={t} money={money} />
    default:
      return <StorageVisual t={t} money={money} />
  }
}

/**
 * Introducción de primera visita. Se puede saltar en cualquier paso; el aviso
 * de almacenamiento local forma parte del recorrido y también de Ajustes.
 */
export function OnboardingFlow() {
  const { t, formatMoney } = useI18n()
  const { completeOnboarding } = useAppState()
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const isLast = index === STEPS.length - 1

  const finish = () => completeOnboarding()
  const next = () => (isLast ? finish() : setIndex((current) => current + 1))
  const back = () => setIndex((current) => Math.max(0, current - 1))

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Brand />
        <button
          type="button"
          onClick={finish}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-text"
        >
          {t('onboarding.skip')}
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pb-4 sm:px-6">
        <div
          key={index}
          className="grid animate-fade-up items-center gap-7 md:grid-cols-[1.05fr_0.95fr] md:gap-10"
        >
          <div className="order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-strong">
              {t('onboarding.eyebrow')}
            </p>
            <h1
              aria-live="polite"
              className="mt-2 font-heading text-[clamp(1.65rem,4.2vw,2.6rem)] font-semibold leading-[1.1] tracking-tight text-text"
            >
              {t(step.titleKey)}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              {t(step.bodyKey)}
            </p>

            <ul className="mt-5 space-y-2.5">
              {step.bullets.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-text">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-soft text-on-success-soft">
                    <CheckIcon className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  <span className="leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>

            {isLast ? (
              <div className="mt-5 rounded-2xl border border-warning/35 bg-warning-soft/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-on-warning-soft">
                  <ShieldIcon className="h-4.5 w-4.5" />
                  {t('onboarding.storageLabel')}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {t('onboarding.storageWarning')}
                </p>
              </div>
            ) : null}
          </div>

          <div className="order-2">
            <StepVisual index={index} t={t} money={formatMoney} />
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" role="group" aria-label={t('onboarding.step', { current: index + 1, total: STEPS.length })}>
              {STEPS.map((item, dot) => (
                <button
                  key={item.titleKey}
                  type="button"
                  aria-label={t('onboarding.step', { current: dot + 1, total: STEPS.length })}
                  aria-current={dot === index ? 'step' : undefined}
                  onClick={() => setIndex(dot)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    dot === index
                      ? 'w-7 bg-primary'
                      : 'w-2 bg-border hover:bg-primary/40',
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted">
              {t('onboarding.step', { current: index + 1, total: STEPS.length })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button variant="ghost" onClick={back} disabled={index === 0}>
              {t('onboarding.back')}
            </Button>
            <Button onClick={next} icon={isLast ? <SparklesIcon className="h-4 w-4" /> : undefined}>
              {isLast ? t('onboarding.start') : t('onboarding.next')}
            </Button>
          </div>
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted sm:justify-start">
          <HeartIcon className="h-3.5 w-3.5 text-primary-strong" />
          {t('onboarding.skipHint')}
        </p>
      </footer>
    </div>
  )
}

