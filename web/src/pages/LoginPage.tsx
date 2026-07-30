import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { GOOGLE_SCOPES, setAccessToken, setProfile } from '../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()

  const login = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token)
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
      <div className="w-full max-w-md">
        <p className="font-display text-4xl text-brand-deep">FluxionAI</p>
        <p className="mt-2 text-ink-muted">
          Entre com a conta Google que tem acesso às agendas do consultório.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-8 w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-deep"
        >
          Entrar com Google
        </button>
        <p className="mt-4 text-center text-xs text-ink-muted">
          Escopo necessário: Google Calendar (leitura e escrita).
        </p>
      </div>
    </div>
  )
}
