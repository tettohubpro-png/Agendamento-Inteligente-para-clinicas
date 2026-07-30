import { useMemo, useState, type FormEvent } from 'react'
import { useClinic } from '../context/ClinicContext'

export function PacientesPage() {
  const { pacientes, addPaciente } = useClinic()
  const [q, setQ] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return pacientes
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.telefone.includes(term) ||
        p.email.toLowerCase().includes(term),
    )
  }, [pacientes, q])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim() || !email.trim()) return
    addPaciente({ nome: nome.trim(), telefone: telefone.trim(), email: email.trim() })
    setNome('')
    setTelefone('')
    setEmail('')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ink">Pacientes</h1>
      <p className="mt-1 text-ink-muted">
        Derivados dos eventos do Google Calendar. Cadastro rápido fica disponível para o próximo
        agendamento.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <input
            className="w-full rounded-xl border border-line bg-panel px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
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
                      Nenhum paciente encontrado nos eventos.
                    </td>
                  </tr>
                )}
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-line/70">
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.telefone}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-xl">Novo paciente</h2>
          <Field label="Nome" value={nome} onChange={setNome} />
          <Field label="Telefone" value={telefone} onChange={setTelefone} />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-deep"
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
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
