import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GOOGLE_SCOPES, setAccessToken, setProfile } from '../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const motivo = params.get('motivo')

  const login = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token, tokenResponse.expires_in)
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        if (res.ok) {
          const profile = await res.json()
          setProfile({
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
          })
        }
      } catch {
        // perfil opcional
      }
      navigate('/')
    },
    onError: () => {
      alert('Falha no login Google. Verifique o Client ID e os origins autorizados.')
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="font-display text-6xl tracking-widest text-brand">BOMCORTE</p>
        <p className="mt-2 text-ink-muted">Estilo e precisão em cada corte</p>
        {motivo && (
          <p className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
            {motivo}
          </p>
        )}
        <p className="mt-6 text-sm text-ink-muted">
          Sistema de gestão completo. Entre com sua conta Google.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-8 w-full rounded-xl bg-brand px-4 py-3 font-medium text-surface transition hover:bg-brand-deep"
        >
          Entrar com Google
        </button>
        <p className="mt-4 text-xs text-ink-muted">
          Cada Gmail é só para login. Todos usam a mesma agenda BOMCORTE.
        </p>
      </div>
    </div>
  )
}
