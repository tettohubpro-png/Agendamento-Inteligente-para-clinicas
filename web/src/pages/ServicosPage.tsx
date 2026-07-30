import { COMBOS, SERVICOS, SERVICOS_AVULSOS } from '../data/barbeariaConfig'

export function ServicosPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl tracking-wide text-ink">Serviços e preços</h1>
      <p className="mt-1 text-ink-muted">Cardápio da BOMCORTE — use ao agendar clientes.</p>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wide text-brand">Combos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {COMBOS.map((s) => (
            <div key={s.id} className="rounded-2xl border border-brand/30 bg-brand-soft/40 p-5">
              <p className="font-display text-xl tracking-wide text-brand">{s.nome}</p>
              <p className="mt-2 text-sm text-ink-muted">{s.descricao}</p>
              <p className="mt-4 text-2xl font-semibold text-ink">R$ {s.preco.toFixed(2)}</p>
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
                <th className="px-4 py-3 font-medium text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              {SERVICOS_AVULSOS.map((s) => (
                <tr key={s.id} className="border-b border-line/70">
                  <td className="px-4 py-3 font-medium">{s.nome}</td>
                  <td className="px-4 py-3 text-right text-brand">R$ {s.preco.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm text-ink-muted">
        Total de {SERVICOS.length} serviços cadastrados. Valores exibidos no painel e enviados ao Google Calendar.
      </p>
    </div>
  )
}
