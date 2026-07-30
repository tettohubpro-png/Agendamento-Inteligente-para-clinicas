import { useMemo, useState } from 'react'
import { useClinic } from '../context/ClinicContext'
import { HORARIOS, MEDICOS, type Medico } from '../data/clinicConfig'
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

const diasLabel = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

export function AgendaPage() {
  const { agendamentos } = useClinic()
  const [medico, setMedico] = useState<Medico | 'todos'>('todos')
  const weekStart = useMemo(() => startOfWeek(), [])
  const dias = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const filtrados = agendamentos.filter(
    (a) => a.status !== 'cancelado' && (medico === 'todos' || a.medico === medico),
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Agenda</h1>
          <p className="mt-1 text-ink-muted">Google Calendar · slots de 30 min (08:00–18:00)</p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-ink-muted">Médico</span>
          <select
            className="rounded-xl border border-line bg-panel px-3 py-2 outline-none ring-brand/30 focus:ring-2"
            value={medico}
            onChange={(e) => setMedico(e.target.value as Medico | 'todos')}
          >
            <option value="todos">Todos</option>
            {MEDICOS.map((m) => (
              <option key={m.nome} value={m.nome}>
                {m.nome} — {m.especialidade}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="min-w-[720px] w-full border-collapse text-sm">
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
                          <div key={a.id} className="mb-1 rounded-lg bg-brand-soft/70 px-2 py-1.5">
                            <p className="font-medium leading-tight">
                              {a.pacienteNome.split(' ')[0]}
                            </p>
                            <p className="text-[11px] text-ink-muted">{a.medico}</p>
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
