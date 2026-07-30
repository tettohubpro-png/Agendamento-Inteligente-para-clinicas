import { useState, type FormEvent } from 'react'
import { useBarbearia } from '../context/BarbeariaContext'
import { BARBEIROS } from '../data/barbeariaConfig'

export function ConfiguracoesPage() {
  const { barbearia, updateBarbearia } = useBarbearia()
  const [form, setForm] = useState(barbearia)
  const [salvo, setSalvo] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateBarbearia(form)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-wide text-ink">Configurações</h1>
      <p className="mt-1 text-ink-muted">Dados da BOMCORTE exibidos no painel.</p>

      <div className="mt-6 space-y-3 rounded-2xl border border-line bg-brand-soft/30 px-4 py-4 text-sm">
        <p>
          <strong>Barbeiros ativos:</strong> {BARBEIROS.map((b) => b.nome).join(', ')}
        </p>
        <p>
          <strong>WhatsApp cliente:</strong>{' '}
          <a href={form.whatsappLink} className="text-brand hover:underline" target="_blank" rel="noreferrer">
            {form.whatsapp}
          </a>
        </p>
        <p className="text-ink-muted">
          Para adicionar barbeiros: crie login Gmail no Google Cloud (usuários de teste) e
          configure <code>CALENDAR_NOME_ID</code> na Netlify para cada agenda.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-panel p-6">
        <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
        <Field label="Slogan" value={form.slogan} onChange={(v) => setForm({ ...form, slogan: v })} />
        <Field label="Endereço" value={form.endereco} onChange={(v) => setForm({ ...form, endereco: v })} />
        <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        <Field label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
        <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
        <Field label="Horário" value={form.horario} onChange={(v) => setForm({ ...form, horario: v })} />
        <Field
          label="Formas de pagamento (separadas por vírgula)"
          value={form.pagamentos.join(', ')}
          onChange={(v) =>
            setForm({
              ...form,
              pagamentos: v.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 font-medium text-surface hover:bg-brand-deep"
        >
          Salvar
        </button>
        {salvo && <p className="text-sm text-ok">Configurações salvas neste navegador.</p>}
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none ring-brand/30 focus:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
