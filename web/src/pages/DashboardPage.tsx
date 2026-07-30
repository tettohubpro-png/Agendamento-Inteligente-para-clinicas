import { Link } from 'react-router-dom'
import { useClinic } from '../context/ClinicContext'

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export function DashboardPage() {
  const { agendamentos } = useClinic()
  const hoje = hojeISO()
  const doDia = agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado')
  const aguardando = doDia.filter((a) => a.status === 'aguardando')
  const proximas = [...doDia].sort((a, b) => a.hora.localeCompare(b.hora)).slice(0, 5)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-4xl text-brand-deep sm:text-5xl">FluxionAI</p>
          <p className="mt-2 max-w-xl text-ink-muted">
            Visão do dia sincronizada com o Google Calendar do Consultório Médico Boa Saúde.
          </p>
        </div>
        <Link
          to="/agendamentos"
          className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-deep"
        >
          Novo agendamento
        </Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Stat label="Consultas hoje" value={String(doDia.length)} />
        <Stat label="Aguardando confirmação" value={String(aguardando.length)} />
        <Stat
          label="Confirmadas"
          value={String(doDia.filter((a) => a.status === 'confirmado').length)}
        />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink">Próximas consultas</h2>
        <p className="mt-1 text-sm text-ink-muted">As 5 próximas do dia, em ordem de horário.</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {proximas.length === 0 && (
            <li className="py-6 text-ink-muted">Nenhuma consulta agendada para hoje.</li>
          )}
          {proximas.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{a.pacienteNome}</p>
                <p className="text-sm text-ink-muted">
                  {a.hora} · {a.medico}
                </p>
              </div>
              <StatusBadge status={a.status} />
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
    confirmado: 'bg-brand-soft text-brand-deep',
    aguardando: 'bg-amber-100 text-amber-900',
    cancelado: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status] ?? ''}`}>
      {status}
    </span>
  )
}
