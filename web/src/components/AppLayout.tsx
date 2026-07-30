import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAuth, getProfile } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import { useErp } from '../context/ErpContext'
import { navForRole, ROLE_LABELS } from '../lib/permissions'
import { NotificationsBell } from './NotificationsBell'
import { isSupabaseConfigured } from '../lib/supabase'

export function AppLayout() {
  const navigate = useNavigate()
  const profile = getProfile()
  const { usuario } = useAuth()
  const { loading, error, refresh, caixaAberto } = useErp()
  const links = usuario ? navForRole(usuario.role) : []

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-panel/90 backdrop-blur lg:border-b-0 lg:border-r lg:min-h-screen">
        <div className="px-5 py-6">
          <p className="font-display text-3xl tracking-widest text-brand">BOMCORTE</p>
          <p className="mt-1 text-sm text-ink-muted">Gestão completa</p>
          {profile?.email && (
            <p className="mt-2 truncate text-xs text-ink-muted">
              {profile.name ?? profile.email}
              {usuario && <span className="block text-brand">{ROLE_LABELS[usuario.role]}</span>}
            </p>
          )}
          {isSupabaseConfigured() && (
            <p className="mt-1 text-xs text-ok">Supabase conectado</p>
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden space-y-2 px-5 pb-6 lg:block">
          {caixaAberto && (
            <p className="text-xs text-brand">Caixa aberto</p>
          )}
          <button type="button" onClick={() => void refresh()} className="block text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline">
            Atualizar dados
          </button>
          <button type="button" onClick={() => { clearAuth(); navigate('/login') }} className="block text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline">
            Sair
          </button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-4 flex justify-end">
          <NotificationsBell />
        </div>
        {loading && <p className="mb-4 text-sm text-ink-muted">Sincronizando…</p>}
        {error && (
          <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-danger">
            <p>{error}</p>
            {(error.toLowerCase().includes('authentication') || error.toLowerCase().includes('token')) && (
              <button
                type="button"
                className="mt-2 underline"
                onClick={() => {
                  clearAuth()
                  navigate('/login')
                }}
              >
                Entrar novamente com Google
              </button>
            )}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
