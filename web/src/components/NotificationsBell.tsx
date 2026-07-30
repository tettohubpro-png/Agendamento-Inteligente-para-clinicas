import { useErp } from '../context/ErpContext'

export function NotificationsBell() {
  const { state, marcarNotificacaoLida } = useErp()
  const naoLidas = state.notificacoes.filter((n) => !n.lida)

  return (
    <div className="relative group">
      <button
        type="button"
        className="relative rounded-lg p-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
        title="Notificações"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {naoLidas.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-surface">
            {naoLidas.length}
          </span>
        )}
      </button>
      <div className="invisible absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-line bg-panel opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        <div className="border-b border-line px-4 py-2 text-sm font-medium">Notificações</div>
        <ul className="max-h-64 overflow-y-auto">
          {state.notificacoes.length === 0 && (
            <li className="px-4 py-3 text-sm text-ink-muted">Nenhuma notificação</li>
          )}
          {state.notificacoes.slice(0, 8).map((n) => (
            <li
              key={n.id}
              className={`cursor-pointer border-b border-line/50 px-4 py-3 text-sm last:border-0 hover:bg-surface-2 ${n.lida ? 'opacity-60' : ''}`}
              onClick={() => marcarNotificacaoLida(n.id)}
            >
              <p className="font-medium">{n.titulo}</p>
              <p className="text-xs text-ink-muted">{n.mensagem}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
