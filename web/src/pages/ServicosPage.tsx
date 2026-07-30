import { useErp } from '../context/ErpContext'
import { PageHeader } from '../components/ui'

export function ServicosPage() {
  const { state } = useErp()
  const combos = state.servicos.filter((s) => s.tipo === 'combo')
  const avulsos = state.servicos.filter((s) => s.tipo === 'avulso')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Serviços" subtitle="Cadastro de serviços, tempo, valor e comissão" />

      <section>
        <h2 className="font-display text-2xl tracking-wide text-brand">Combos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {combos.map((s) => (
            <div key={s.id} className="rounded-2xl border border-brand/30 bg-brand-soft/40 p-5">
              <p className="font-display text-xl tracking-wide text-brand">{s.nome}</p>
              <p className="mt-2 text-sm text-ink-muted">{s.descricao}</p>
              <p className="mt-1 text-xs text-ink-muted">{s.duracaoMinutos} min · Comissão {s.comissaoPercentual}%</p>
              <p className="mt-4 text-2xl font-semibold text-ink">R$ {s.valor.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-wide text-ink">Serviços avulsos</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-panel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Duração</th>
                <th className="px-4 py-3 font-medium">Comissão</th>
                <th className="px-4 py-3 font-medium text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              {avulsos.map((s) => (
                <tr key={s.id} className="border-b border-line/70">
                  <td className="px-4 py-3 font-medium">{s.nome}</td>
                  <td className="px-4 py-3 text-ink-muted">{s.duracaoMinutos} min</td>
                  <td className="px-4 py-3 text-ink-muted">{s.comissaoPercentual}%</td>
                  <td className="px-4 py-3 text-right text-brand">R$ {s.valor.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
