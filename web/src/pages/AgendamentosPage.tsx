import { useMemo, useState, type FormEvent } from 'react'
import { useErp } from '../context/ErpContext'
import { Btn, PageHeader, StatusBadge } from '../components/ui'
import type { AgendamentoStatus } from '../types/erp'
import { HORARIOS } from '../data/barbeariaConfig'

const STATUS_FLOW: AgendamentoStatus[] = ['agendado', 'confirmado', 'em_atendimento', 'finalizado', 'cancelado', 'nao_compareceu']

export function AgendamentosPage() {
  const { state, createAgendamento, updateStatus, cancelAgendamento } = useErp()
  const { agendamentos, clientes, servicos, barbeiros } = state
  const [filtro, setFiltro] = useState<'todos' | AgendamentoStatus>('todos')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [barbeiroId, setBarbeiroId] = useState(barbeiros[0]?.id ?? '')
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? '')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [hora, setHora] = useState('09:00')
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  const servico = servicos.find((s) => s.id === servicoId)
  const barbeiro = barbeiros.find((b) => b.id === barbeiroId)

  const lista = useMemo(() => {
    const sorted = [...agendamentos].sort((a, b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`))
    if (filtro === 'todos') return sorted
    return sorted.filter((a) => a.status === filtro)
  }, [agendamentos, filtro])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim() || !servico || !barbeiro) {
      setErro('Preencha todos os campos.')
      return
    }
    setSaving(true)
    try {
      await createAgendamento({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        barbeiro: barbeiro.nome as 'Maycon',
        servico: servico.nome,
        valor: servico.valor,
        data,
        hora,
        status: 'aguardando',
      })
      setNome('')
      setTelefone('')
      setEmail('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao agendar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Agendamentos" subtitle="Fluxo completo: agendado → confirmado → atendimento → finalizado" />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['todos', ...STATUS_FLOW] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFiltro(s)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${filtro === s ? 'bg-brand text-surface' : 'bg-surface-2 text-ink-muted hover:text-ink'}`}
          >
            {s === 'todos' ? 'Todos' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                <th className="px-4 py-3">Data/Hora</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Barbeiro</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{a.data} {a.hora}</td>
                  <td className="px-4 py-3 font-medium">{a.clienteNome}</td>
                  <td className="px-4 py-3 text-ink-muted">{a.servico}</td>
                  <td className="px-4 py-3">{a.barbeiro}</td>
                  <td className="px-4 py-3 text-brand">R$ {a.valor.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.status === 'agendado' && (
                        <Btn variant="secondary" onClick={() => void updateStatus(a.id, 'confirmado')}>Confirmar</Btn>
                      )}
                      {a.status === 'confirmado' && (
                        <Btn variant="secondary" onClick={() => void updateStatus(a.id, 'em_atendimento')}>Iniciar</Btn>
                      )}
                      {a.status === 'em_atendimento' && (
                        <Btn onClick={() => void updateStatus(a.id, 'finalizado')}>Finalizar</Btn>
                      )}
                      {!['cancelado', 'finalizado'].includes(a.status) && (
                        <Btn variant="danger" onClick={() => void cancelAgendamento(a)}>Cancelar</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-panel p-5 h-fit">
          <h2 className="font-display text-xl">Novo agendamento</h2>
          {erro && <p className="text-sm text-danger">{erro}</p>}
          <select className="w-full rounded-xl border border-line bg-surface px-3 py-2" value="" onChange={(e) => {
            const c = clientes.find((x) => x.id === e.target.value)
            if (c) { setNome(c.nome); setTelefone(c.telefone); setEmail(c.email ?? '') }
          }}>
            <option value="">Cliente cadastrado…</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <input className="w-full rounded-xl border border-line bg-surface px-3 py-2" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className="w-full rounded-xl border border-line bg-surface px-3 py-2" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          <input className="w-full rounded-xl border border-line bg-surface px-3 py-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="w-full rounded-xl border border-line bg-surface px-3 py-2" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
            {barbeiros.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
          <select className="w-full rounded-xl border border-line bg-surface px-3 py-2" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
            {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome} — R$ {s.valor}</option>)}
          </select>
          <input type="date" className="w-full rounded-xl border border-line bg-surface px-3 py-2" value={data} onChange={(e) => setData(e.target.value)} />
          <select className="w-full rounded-xl border border-line bg-surface px-3 py-2" value={hora} onChange={(e) => setHora(e.target.value)}>
            {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-surface hover:bg-brand-deep disabled:opacity-50">
            {saving ? 'Salvando…' : 'Agendar'}
          </button>
        </form>
      </div>
    </div>
  )
}
