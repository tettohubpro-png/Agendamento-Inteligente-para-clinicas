import { Link } from 'react-router-dom'
import { useBarbearia } from '../context/BarbeariaContext'
import { barbeariaConfig } from '../data/barbeariaConfig'

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export function DashboardPage() {
  const { agendamentos } = useBarbearia()
  const hoje = hojeISO()
  const doDia = agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado')
  const aguardando = doDia.filter((a) => a.status === 'aguardando')
  const proximos = [...doDia].sort((a, b) => a.hora.localeCompare(b.hora)).slice(0, 5)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-5xl tracking-widest text-brand sm:text-6xl">BOMCORTE</p>
          <p className="mt-2 max-w-xl text-ink-muted">
            Visão do dia · {barbeariaConfig.horario}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            to="/agendamentos"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 font-medium text-surface transition hover:bg-brand-deep"
          >
            Novo agendamento
          </Link>
          <a
            href={barbeariaConfig.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-brand/40 px-5 py-2.5 text-sm font-medium text-brand transition hover:bg-brand-soft"
          >
            WhatsApp do cliente
          </a>
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Stat label="Agendamentos hoje" value={String(doDia.length)} />
        <Stat label="Aguardando confirmação" value={String(aguardando.length)} />
        <Stat
          label="Confirmados"
          value={String(doDia.filter((a) => a.status === 'confirmado').length)}
        />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-wide text-ink">Próximos horários</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {proximos.length === 0 && (
            <li className="py-6 text-ink-muted">Nenhum agendamento para hoje.</li>
          )}
          {proximos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{a.clienteNome}</p>
                <p className="text-sm text-ink-muted">
                  {a.hora} · {a.servico} · {a.barbeiro}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-brand">R$ {a.valor.toFixed(2)}</span>
                <StatusBadge status={a.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-4xl text-ink">{value}</p>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmado: 'bg-brand-soft text-brand',
    aguardando: 'bg-amber-950/60 text-amber-300',
    cancelado: 'bg-red-950/60 text-red-300',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status] ?? ''}`}>
      {status}
    </span>
  )
}
