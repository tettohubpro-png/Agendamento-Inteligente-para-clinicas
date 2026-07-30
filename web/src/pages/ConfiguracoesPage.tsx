import { useState, type FormEvent } from 'react'
import { useErp } from '../context/ErpContext'
import { useAuth } from '../context/AuthContext'
import { PermissionGate } from '../components/PermissionGate'
import { PageHeader } from '../components/ui'
import { ROLE_LABELS } from '../lib/permissions'
import type { UserRole } from '../types/erp'

export function ConfiguracoesPage() {
  const { state, updateEmpresa, updateUsuarios, addUsuario } = useErp()
  const { usuario } = useAuth()
  const [form, setForm] = useState(state.empresa)
  const [salvo, setSalvo] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoRole, setNovoRole] = useState<UserRole>('barbeiro')
  const [erroUsuario, setErroUsuario] = useState('')
  const [okUsuario, setOkUsuario] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateEmpresa(form)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  function onAddUsuario(e: FormEvent) {
    e.preventDefault()
    setErroUsuario('')
    setOkUsuario('')
    const err = addUsuario({ email: novoEmail, nome: novoNome, role: novoRole })
    if (err) {
      setErroUsuario(err)
      return
    }
    setOkUsuario('Usuário cadastrado. Libere o e-mail também em Usuários de teste no Google Cloud.')
    setNovoNome('')
    setNovoEmail('')
    setNovoRole('barbeiro')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" subtitle="Dados da empresa, metas, usuários e permissões" />

      <div className="mb-6 space-y-2 rounded-2xl border border-line bg-brand-soft/30 px-4 py-4 text-sm">
        <p><strong>Seu perfil:</strong> {usuario?.nome} · {usuario ? ROLE_LABELS[usuario.role] : ''}</p>
        <p><strong>Barbeiros:</strong> {state.barbeiros.map((b) => b.nome).join(', ')}</p>
        <p><strong>WhatsApp:</strong> <a href={form.whatsappLink} className="text-brand hover:underline" target="_blank" rel="noreferrer">{form.whatsapp}</a></p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-panel p-6">
        <h2 className="font-display text-xl">Dados da empresa</h2>
        <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
        <Field label="Slogan" value={form.slogan} onChange={(v) => setForm({ ...form, slogan: v })} />
        <Field label="Endereço" value={form.endereco} onChange={(v) => setForm({ ...form, endereco: v })} />
        <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        <Field label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
        <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="PIX" value={form.pix} onChange={(v) => setForm({ ...form, pix: v })} />
        <Field label="Banco" value={form.banco} onChange={(v) => setForm({ ...form, banco: v })} />
        <Field label="Meta mensal (R$)" value={String(form.metaMensal)} onChange={(v) => setForm({ ...form, metaMensal: Number(v) })} />
        <Field label="Horário abertura" value={form.horarioAbertura} onChange={(v) => setForm({ ...form, horarioAbertura: v })} />
        <Field label="Horário fechamento" value={form.horarioFim} onChange={(v) => setForm({ ...form, horarioFim: v })} />
        <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-surface hover:bg-brand-deep">
          {salvo ? 'Salvo!' : 'Salvar configurações'}
        </button>
      </form>

      <PermissionGate permission="usuarios:edit">
        <section className="mt-8 rounded-2xl border border-line bg-panel p-6">
          <h2 className="font-display text-xl">Usuários e permissões</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Cadastre o Gmail aqui (só para login) e libere o mesmo e-mail em <strong>Público-alvo → Usuários de teste</strong> no Google Cloud.
            A agenda é única e compartilhada — não depende do calendário pessoal de cada um.
          </p>

          <form onSubmit={onAddUsuario} className="mt-4 space-y-3 rounded-xl border border-line bg-surface-2 p-4">
            <h3 className="text-sm font-medium">Adicionar usuário</h3>
            <input
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
            />
            <input
              type="email"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
              placeholder="Gmail (ex: maycon@gmail.com)"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              required
            />
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
              value={novoRole}
              onChange={(e) => setNovoRole(e.target.value as UserRole)}
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            {erroUsuario && <p className="text-sm text-danger">{erroUsuario}</p>}
            {okUsuario && <p className="text-sm text-ok">{okUsuario}</p>}
            <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-surface hover:bg-brand-deep">
              Cadastrar Gmail
            </button>
          </form>

          <ul className="mt-4 space-y-3">
            {state.usuarios.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{u.nome}</p>
                  <p className="text-ink-muted">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-line bg-surface px-2 py-1"
                    value={u.role}
                    onChange={(e) => {
                      const role = e.target.value as UserRole
                      updateUsuarios(state.usuarios.map((x) => (x.id === u.id ? { ...x, role } : x)))
                    }}
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  {u.email !== usuario?.email && (
                    <button
                      type="button"
                      className="text-xs text-danger hover:underline"
                      onClick={() => updateUsuarios(state.usuarios.filter((x) => x.id !== u.id))}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </PermissionGate>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
