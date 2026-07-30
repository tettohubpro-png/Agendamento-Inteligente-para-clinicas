import { useMemo, useState, type FormEvent } from 'react'
import { useClinic, type Medico } from '../context/ClinicContext'
import { HORARIOS, MEDICOS } from '../data/clinicConfig'
import { StatusBadge } from './DashboardPage'

export function AgendamentosPage() {
  const { agendamentos, pacientes, addAgendamento, updateAgendamentoStatus, cancelAgendamento } =
    useClinic()
  const [pacienteId, setPacienteId] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [medico, setMedico] = useState<Medico>('Dr. Elizeu')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [hora, setHora] = useState('09:00')
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  const selected = useMemo(
    () => pacientes.find((p) => p.id === pacienteId),
    [pacientes, pacienteId],
  )

  function onSelectPaciente(id: string) {
    setPacienteId(id)
    const p = pacientes.find((x) => x.id === id)
    if (p) {
      setNome(p.nome)
      setTelefone(p.telefone)
      setEmail(p.email)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) {
      setErro('Informe o nome do paciente.')
      return
    }
    setSaving(true)
    try {
      await addAgendamento({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        medico,
        data,
        hora,
        status: 'aguardando',
      })
      setNome('')
      setTelefone('')
      setEmail('')
      setPacienteId('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao agendar')
    } finally {
      setSaving(false)
    }
  }

  const ordenados = [...agendamentos].sort((a, b) =>
    `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`),
  )

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ink">Agendamentos</h1>
      <p className="mt-1 text-ink-muted">Criar, confirmar ou cancelar no Google Calendar.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium">Médico</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-ink-muted">
                    Nenhum evento encontrado nas agendas configuradas.
                  </td>
                </tr>
              )}
              {ordenados.map((a) => (
                <tr key={a.id} className="border-b border-line/70">
                  <td className="px-4 py-3 font-medium">{a.pacienteNome}</td>
                  <td className="px-4 py-3 text-ink-muted">{a.medico}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {a.data} · {a.hora}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {a.status !== 'confirmado' && (
                        <Action
                          label="Confirmar"
                          onClick={() => void updateAgendamentoStatus(a, 'confirmado')}
                        />
                      )}
                      <Action
                        label="Cancelar"
                        danger
                        onClick={() => void cancelAgendamento(a)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-xl">Novo agendamento</h2>
          {pacientes.length > 0 && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Paciente existente</span>
              <select
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
                value={pacienteId}
                onChange={(e) => onSelectPaciente(e.target.value)}
              >
                <option value="">— Novo / manual —</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Field label="Nome" value={nome} onChange={setNome} />
          <Field label="Telefone" value={telefone} onChange={setTelefone} />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Médico</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
              value={medico}
              onChange={(e) => setMedico(e.target.value as Medico)}
            >
              {MEDICOS.map((m) => (
                <option key={m.nome} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Data</span>
            <input
              type="date"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Horário</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            >
              {HORARIOS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <p className="text-xs text-ink-muted">Usando dados de {selected.nome}.</p>
          )}
          {erro && <p className="text-sm text-danger">{erro}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {saving ? 'Agendando…' : 'Agendar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        type={type}
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Action({
  label,
  onClick,
  danger,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium underline-offset-2 hover:underline ${danger ? 'text-danger' : 'text-brand-deep'}`}
    >
      {label}
    </button>
  )
}
