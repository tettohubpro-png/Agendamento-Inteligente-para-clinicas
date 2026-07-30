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
      <div className="w-full max-w-md text-center">
        <p className="font-display text-6xl tracking-widest text-brand">BOMCORTE</p>
        <p className="mt-2 text-ink-muted">Estilo e precisão em cada corte</p>
        <p className="mt-6 text-sm text-ink-muted">
          Painel para barbeiros e equipe. Entre com sua conta Google.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-8 w-full rounded-xl bg-brand px-4 py-3 font-medium text-surface transition hover:bg-brand-deep"
        >
          Entrar com Google
        </button>
        <p className="mt-4 text-xs text-ink-muted">
          Cada barbeiro acessa com seu Gmail. Adicione novos logins como usuários de teste no Google Cloud.
        </p>
      </div>
    </div>
  )
}
