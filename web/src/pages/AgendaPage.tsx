import { useMemo, useState } from 'react'
import { useBarbearia } from '../context/BarbeariaContext'
import { BARBEIROS, HORARIOS, type Barbeiro } from '../data/barbeariaConfig'
import { StatusBadge } from './DashboardPage'

function startOfWeek(d = new Date()) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

const diasLabel = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function AgendaPage() {
  const { agendamentos } = useBarbearia()
  const [barbeiro, setBarbeiro] = useState<Barbeiro | 'todos'>('todos')
  const weekStart = useMemo(() => startOfWeek(), [])
  const dias = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const filtrados = agendamentos.filter(
    (a) => a.status !== 'cancelado' && (barbeiro === 'todos' || a.barbeiro === barbeiro),
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-ink">Agenda</h1>
          <p className="mt-1 text-ink-muted">Seg–Sáb · 08:30–18:00 · slots de 30 min</p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-ink-muted">Barbeiro</span>
          <select
            className="rounded-xl border border-line bg-panel px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
            value={barbeiro}
            onChange={(e) => setBarbeiro(e.target.value as Barbeiro | 'todos')}
          >
            <option value="todos">Todos</option>
            {BARBEIROS.map((b) => (
              <option key={b.nome} value={b.nome}>
                {b.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="min-w-[800px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/60">
              <th className="px-3 py-3 text-left font-medium text-ink-muted">Horário</th>
              {dias.map((d, i) => (
                <th key={toISO(d)} className="px-3 py-3 text-left font-medium">
                  {diasLabel[i]}
                  <span className="ml-1 text-ink-muted">
                    {d.getDate()}/{d.getMonth() + 1}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORARIOS.map((hora) => (
              <tr key={hora} className="border-b border-line/70 align-top">
                <td className="px-3 py-2 font-medium text-ink-muted">{hora}</td>
                {dias.map((d) => {
                  const iso = toISO(d)
                  const slot = filtrados.filter((a) => a.data === iso && a.hora === hora)
                  return (
                    <td key={iso + hora} className="px-2 py-2">
                      {slot.length === 0 ? (
                        <span className="text-xs text-line">—</span>
                      ) : (
                        slot.map((a) => (
                          <div key={a.id} className="mb-1 rounded-lg bg-brand-soft/80 px-2 py-1.5">
                            <p className="font-medium leading-tight text-ink">
                              {a.clienteNome.split(' ')[0]}
                            </p>
                            <p className="text-[11px] text-ink-muted">{a.servico}</p>
                            <div className="mt-1">
                              <StatusBadge status={a.status} />
                            </div>
                          </div>
                        ))
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
