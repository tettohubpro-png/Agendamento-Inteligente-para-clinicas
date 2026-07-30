import { useErp } from '../context/ErpContext'
import { BarChart, Card, PageHeader, StatCard } from '../components/ui'

export function FinanceiroPage() {
  const { state, kpis } = useErp()
  const { vendas, despesas } = state

  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0)
  const lucro = kpis.receitaMes - totalDespesas

  const porForma = ['pix', 'dinheiro', 'debito', 'credito'].map((f) => ({
    forma: f.toUpperCase(),
    valor: vendas.filter((v) => v.formaPagamento === f).reduce((s, v) => s + v.valor, 0),
  }))

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Financeiro" subtitle="Entradas, saídas, fluxo de caixa e lucro" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Receita hoje" value={kpis.receitaHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
        <StatCard label="Receita semana" value={kpis.receitaSemana.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <StatCard label="Receita mês" value={kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
        <StatCard label="Lucro líquido" value={lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub={`Despesas: ${totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl">Por forma de pagamento</h2>
          <div className="mt-4">
            <BarChart data={porForma} labelKey="forma" valueKey="valor" />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl">Despesas recentes</h2>
          <ul className="mt-4 divide-y divide-line">
            {despesas.length === 0 && <li className="py-3 text-sm text-ink-muted">Nenhuma despesa registrada.</li>}
            {despesas.slice(0, 8).map((d) => (
              <li key={d.id} className="flex justify-between py-3 text-sm">
                <span>{d.descricao} {d.categoria && <span className="text-ink-muted">({d.categoria})</span>}</span>
                <span className="text-danger">- {d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-xl">Fluxo de caixa</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-950/30 p-4">
            <p className="text-sm text-ink-muted">Entradas</p>
            <p className="text-xl font-medium text-emerald-300">{kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="rounded-xl bg-red-950/30 p-4">
            <p className="text-sm text-ink-muted">Saídas</p>
            <p className="text-xl font-medium text-red-300">{totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="rounded-xl bg-brand-soft p-4">
            <p className="text-sm text-ink-muted">Saldo</p>
            <p className="text-xl font-medium text-brand">{lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
