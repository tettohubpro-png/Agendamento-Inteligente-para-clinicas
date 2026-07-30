import { useMemo, useState, type FormEvent } from 'react'
import { useBarbearia } from '../context/BarbeariaContext'

export function ClientesPage() {
  const { clientes, addCliente } = useBarbearia()
  const [q, setQ] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return clientes
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        c.telefone.includes(term) ||
        c.email.toLowerCase().includes(term),
    )
  }, [clientes, q])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return
    addCliente({ nome: nome.trim(), telefone: telefone.trim(), email: email.trim() })
    setNome('')
    setTelefone('')
    setEmail('')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl tracking-wide text-ink">Clientes</h1>
      <p className="mt-1 text-ink-muted">
        Derivados dos agendamentos no Google Calendar.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <input
            className="w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-ink outline-none ring-brand/30 focus:ring-2"
            placeholder="Buscar por nome, telefone ou e-mail"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-panel">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-line bg-surface-2/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-ink-muted">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
                {filtrados.map((c) => (
                  <tr key={c.id} className="border-b border-line/70">
                    <td className="px-4 py-3 font-medium">{c.nome}</td>
                    <td className="px-4 py-3 text-ink-muted">{c.telefone}</td>
                    <td className="px-4 py-3 text-ink-muted">{c.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-xl tracking-wide">Novo cliente</h2>
          <Field label="Nome" value={nome} onChange={setNome} />
          <Field label="Telefone" value={telefone} onChange={setTelefone} />
          <Field label="E-mail (opcional)" value={email} onChange={setEmail} type="email" />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-surface hover:bg-brand-deep"
          >
            Cadastrar
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
