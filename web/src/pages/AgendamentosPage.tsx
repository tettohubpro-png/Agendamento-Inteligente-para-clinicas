import { useMemo, useState, type FormEvent } from 'react'
import { useBarbearia, type Barbeiro } from '../context/BarbeariaContext'
import {
  BARBEIROS,
  HORARIOS,
  SERVICOS,
  servicoPorId,
} from '../data/barbeariaConfig'
import { StatusBadge } from './DashboardPage'

export function AgendamentosPage() {
  const { agendamentos, clientes, addAgendamento, updateAgendamentoStatus, cancelAgendamento } =
    useBarbearia()
  const [clienteId, setClienteId] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [barbeiro, setBarbeiro] = useState<Barbeiro>('Maycon')
  const [servicoId, setServicoId] = useState(SERVICOS[0].id)
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [hora, setHora] = useState('09:00')
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  const servico = servicoPorId(servicoId)

  const selected = useMemo(
    () => clientes.find((c) => c.id === clienteId),
    [clientes, clienteId],
  )

  function onSelectCliente(id: string) {
    setClienteId(id)
    const c = clientes.find((x) => x.id === id)
    if (c) {
      setNome(c.nome)
      setTelefone(c.telefone)
      setEmail(c.email)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) {
      setErro('Informe o nome do cliente.')
      return
    }
    if (!servico) {
      setErro('Selecione um serviço.')
      return
    }
    setSaving(true)
    try {
      await addAgendamento({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        barbeiro,
        servico: servico.nome,
        valor: servico.preco,
        data,
        hora,
        status: 'aguardando',
      })
      setNome('')
      setTelefone('')
      setEmail('')
      setClienteId('')
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
      <h1 className="font-display text-3xl tracking-wide text-ink">Agendamentos</h1>
      <p className="mt-1 text-ink-muted">Criar, confirmar ou cancelar no Google Calendar.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Barbeiro</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-ink-muted">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
              {ordenados.map((a) => (
                <tr key={a.id} className="border-b border-line/70">
                  <td className="px-4 py-3 font-medium">{a.clienteNome}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {a.servico}
                    <span className="ml-1 text-brand">R$ {a.valor.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{a.barbeiro}</td>
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
          <h2 className="font-display text-xl tracking-wide">Novo agendamento</h2>
          {clientes.length > 0 && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Cliente existente</span>
              <select
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
                value={clienteId}
                onChange={(e) => onSelectCliente(e.target.value)}
              >
                <option value="">— Novo / manual —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Field label="Nome" value={nome} onChange={setNome} />
          <Field label="Telefone" value={telefone} onChange={setTelefone} />
          <Field label="E-mail (opcional)" value={email} onChange={setEmail} type="email" />
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Serviço</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
            >
              <optgroup label="Combos">
                {SERVICOS.filter((s) => s.tipo === 'combo').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — R$ {s.preco.toFixed(2)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Avulsos">
                {SERVICOS.filter((s) => s.tipo === 'avulso').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — R$ {s.preco.toFixed(2)}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Barbeiro</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
              value={barbeiro}
              onChange={(e) => setBarbeiro(e.target.value as Barbeiro)}
            >
              {BARBEIROS.map((b) => (
                <option key={b.nome} value={b.nome}>
                  {b.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Data</span>
            <input
              type="date"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Horário</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
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
          {servico && (
            <p className="text-sm text-brand">
              Total: R$ {servico.preco.toFixed(2)}
            </p>
          )}
          {selected && (
            <p className="text-xs text-ink-muted">Usando dados de {selected.nome}.</p>
          )}
          {erro && <p className="text-sm text-danger">{erro}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-surface hover:bg-brand-deep disabled:opacity-60"
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
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
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
      className={`text-xs font-medium underline-offset-2 hover:underline ${danger ? 'text-danger' : 'text-brand'}`}
    >
      {label}
    </button>
  )
}
