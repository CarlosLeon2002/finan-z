import { useCallback, useEffect, useState } from 'react'

/**
 * Router mínimo por hash (#/ahorrar): sin dependencias y con soporte de
 * “atrás/adelante” del navegador, que es lo que un usuario espera.
 */
export const ROUTES = ['home', 'savings', 'partition', 'tips', 'settings'] as const

export type Route = (typeof ROUTES)[number]

const DEFAULT_ROUTE: Route = 'home'

function parseHash(): Route {
  const segment = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as readonly string[]).includes(segment) ? (segment as Route) : DEFAULT_ROUTE
}

export interface Router {
  route: Route
  navigate: (route: Route) => void
}

export function useRoute(): Router {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next: Route) => {
    if (window.location.hash !== `#/${next}`) {
      window.location.hash = `/${next}`
    }
    setRoute(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return { route, navigate }
}
