import { useEffect } from 'react'
import { useRoute } from './app/router'
import { useAppState } from './app/state'
import { AppStateProvider } from './app/StateProvider'
import { I18nProvider } from './app/I18nProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { LanguageGate } from './features/onboarding/LanguageGate'
import { PartitionPage } from './features/partition/PartitionPage'
import { SavingsPage } from './features/savings/SavingsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { TipsPage } from './features/tips/TipsPage'

function RoutedContent() {
  const { route } = useRoute()

  // Cada pestaña del dock abre su página desde arriba, sin heredar el scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  switch (route) {
    case 'savings':
      return <SavingsPage />
    case 'partition':
      return <PartitionPage />
    case 'tips':
      return <TipsPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <DashboardPage />
  }
}

/**
 * Orden de los providers:
 * 1. Estado global (lee/guarda en el dispositivo).
 * 2. i18n (depende de `settings.locale`).
 * 3. Pantalla de bienvenida o la app con su estructura.
 */
function Root() {
  const { state } = useAppState()

  // Primera visita: elegir idioma antes de mostrar cualquier dato.
  if (state.settings.locale === null) return <LanguageGate />

  return (
    <AppShell>
      <RoutedContent />
    </AppShell>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <ThemeProvider>
        <I18nProvider>
          <Root />
        </I18nProvider>
      </ThemeProvider>
    </AppStateProvider>
  )
}
