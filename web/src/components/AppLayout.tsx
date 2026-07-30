import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAuth, getProfile } from '../lib/auth'
import { useClinic } from '../context/ClinicContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/pacientes', label: 'Pacientes' },
  { to: '/agendamentos', label: 'Agendamentos' },
  { to: '/configuracoes', label: 'Configurações' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const profile = getProfile()
  const { error, loading, refresh } = useClinic()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-panel/90 backdrop-blur lg:border-b-0 lg:border-r lg:min-h-screen">
        <div className="px-5 py-6">
          <p className="font-display text-2xl tracking-tight text-brand-deep">FluxionAI</p>
          <p className="mt-1 text-sm text-ink-muted">Consultório Boa Saúde</p>
          {profile?.email && (
            <p className="mt-2 truncate text-xs text-ink-muted">{profile.email}</p>
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
                  isActive
                    ? 'bg-brand-soft text-brand-deep'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden space-y-2 px-5 pb-6 lg:block">
          <button
            type="button"
            onClick={() => void refresh()}
            className="block text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Atualizar agenda
          </button>
          <button
            type="button"
            onClick={() => {
              clearAuth()
              navigate('/login')
            }}
            className="block text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8 sm:py-8">
        {loading && <p className="mb-4 text-sm text-ink-muted">Sincronizando Google Calendar…</p>}
        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Outlet />
      </main>
    </div>
  )
}
