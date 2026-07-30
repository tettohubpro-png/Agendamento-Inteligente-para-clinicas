import { GoogleOAuthProvider } from '@react-oauth/google'
import { useEffect, useState, type ReactNode } from 'react'
import { fetchAuthConfig } from '../lib/calendarApi'

export function GoogleAuthShell({ children }: { children: ReactNode }) {
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
  const [ready, setReady] = useState(Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID))
  const [error, setError] = useState('')

  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) return
    fetchAuthConfig()
      .then((cfg) => {
        setClientId(cfg.clientId)
        setReady(true)
      })
      .catch((err: Error) => {
        setError(err.message)
        setReady(true)
      })
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        Carregando autenticação…
      </div>
    )
  }

  if (!clientId) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
        <p className="font-display text-3xl text-brand-deep">FluxionAI</p>
        <p className="mt-3 text-ink-muted">
          Configure <code className="text-ink">VITE_GOOGLE_CLIENT_ID</code> no{' '}
          <code className="text-ink">.env.local</code> ou nas variáveis da Netlify.
        </p>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    )
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
}
