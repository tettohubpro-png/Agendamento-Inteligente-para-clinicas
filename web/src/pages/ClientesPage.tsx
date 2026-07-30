import { useMemo, useState, type FormEvent } from 'react'
import { useErp } from '../context/ErpContext'
import { Card, PageHeader } from '../components/ui'
import { StatusBadge } from '../components/ui'

export function ClientesPage() {
  const { state, addCliente } = useErp()
  const { clientes, agendamentos, vendas } = state
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return clientes
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        c.telefone.includes(term) ||
        (c.email ?? '').toLowerCase().includes(term),
    )
  }, [clientes, q])

  const clienteSel = clientes.find((c) => c.id === selected)
  const historico = clienteSel
    ? agendamentos.filter((a) => a.clienteTelefone === clienteSel.telefone || a.clienteId === clienteSel.id)
    : []

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return
    addCliente({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || telefone.trim(),
      observacoes: observacoes.trim(),
    })
    setNome('')
    setTelefone('')
    setEmail('')
    setWhatsapp('')
    setObservacoes('')
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Clientes" subtitle="CRM completo com histórico e observações" />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <input
            className="w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-ink outline-none ring-brand/30 focus:ring-2"
            placeholder="Buscar por nome, telefone ou e-mail"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-panel">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-line bg-surface-2/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Atendimentos</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-ink-muted">Nenhum cliente.</td></tr>
                )}
                {filtrados.map((c) => {
                  const atend = agendamentos.filter((a) => a.clienteTelefone === c.telefone).length
                  return (
                    <tr
                      key={c.id}
                      className={`cursor-pointer border-b border-line/70 hover:bg-surface-2/40 ${selected === c.id ? 'bg-brand-soft/30' : ''}`}
                      onClick={() => setSelected(c.id)}
                    >
                      <td className="px-4 py-3 font-medium">{c.nome}</td>
                      <td className="px-4 py-3 text-ink-muted">{c.telefone}</td>
                      <td className="px-4 py-3 text-ink-muted">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-brand">{atend}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {clienteSel && (
            <Card className="mt-6">
              <h2 className="font-display text-xl">{clienteSel.nome}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-ink-muted">Total gasto</p>
                  <p className="text-lg font-medium text-brand">
                    {vendas.filter((v) => v.clienteId === clienteSel.id).reduce((s, v) => s + v.valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Atendimentos</p>
                  <p className="text-lg font-medium">{historico.length}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Próximo</p>
                  <p className="text-sm">
                    {historico.find((a) => a.data >= new Date().toISOString().slice(0, 10) && !['cancelado', 'finalizado'].includes(a.status))
                      ? `${historico.find((a) => !['cancelado', 'finalizado'].includes(a.status))?.data} ${historico.find((a) => !['cancelado', 'finalizado'].includes(a.status))?.hora}`
                      : '—'}
                  </p>
                </div>
              </div>
              {clienteSel.observacoes && (
                <p className="mt-4 text-sm text-ink-muted">Obs: {clienteSel.observacoes}</p>
              )}
              <ul className="mt-4 divide-y divide-line">
                {historico.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex justify-between py-2 text-sm">
                    <span>{a.data} {a.hora} · {a.servico}</span>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-panel p-5 h-fit">
          <h2 className="font-display text-xl tracking-wide">Novo cliente</h2>
          <Field label="Nome" value={nome} onChange={setNome} />
          <Field label="Telefone" value={telefone} onChange={setTelefone} />
          <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <Field label="Observações" value={observacoes} onChange={setObservacoes} />
          <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-surface hover:bg-brand-deep">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input type={type} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
