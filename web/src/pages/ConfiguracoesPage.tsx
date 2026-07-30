import { useState, type FormEvent } from 'react'
import { useClinic } from '../context/ClinicContext'

export function ConfiguracoesPage() {
  const { clinica, updateClinica } = useClinic()
  const [form, setForm] = useState(clinica)
  const [salvo, setSalvo] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateClinica(form)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">Configurações</h1>
      <p className="mt-1 text-ink-muted">
        Dados exibidos no painel (locais nesta fase). Agendas Google vêm das variáveis de ambiente.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-brand-soft/40 px-4 py-3 text-sm text-ink">
        <p>
          <strong>Dr. Elizeu:</strong>{' '}
          {import.meta.env.VITE_CALENDAR_ELIZEU_ID || 'primary (padrão)'}
        </p>
        <p className="mt-1">
          <strong>Dr. Paulo:</strong>{' '}
          {import.meta.env.VITE_CALENDAR_PAULO_ID || 'primary (padrão)'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-panel p-6">
        <Field label="Nome da clínica" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
        <Field
          label="Endereço"
          value={form.endereco}
          onChange={(v) => setForm({ ...form, endereco: v })}
        />
        <Field
          label="Telefone / WhatsApp"
          value={form.telefone}
          onChange={(v) => setForm({ ...form, telefone: v })}
        />
        <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Site" value={form.site} onChange={(v) => setForm({ ...form, site: v })} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Valor da consulta (R$)</span>
          <input
            type="number"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
            value={form.valorConsulta}
            onChange={(e) => setForm({ ...form, valorConsulta: Number(e.target.value) })}
          />
        </label>
        <Field
          label="Formas de pagamento (separadas por vírgula)"
          value={form.pagamentos.join(', ')}
          onChange={(v) =>
            setForm({
              ...form,
              pagamentos: v
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <Field
          label="Convênio"
          value={form.convenio}
          onChange={(v) => setForm({ ...form, convenio: v })}
        />
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-deep"
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
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none ring-brand/30 focus:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
