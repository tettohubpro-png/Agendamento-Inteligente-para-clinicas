import { Link } from 'react-router-dom'
import { useErp } from '../context/ErpContext'
import { BarChart, Card, PageHeader, StatCard, StatusBadge } from '../components/ui'
import { hoje } from '../lib/erpStore'

export function DashboardPage() {
  const { state, kpis } = useErp()
  const today = hoje()
  const doDia = state.agendamentos
    .filter((a) => a.data === today)
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const progressoMeta = Math.min(100, Math.round((kpis.receitaMes / kpis.metaMes) * 100))

  const servicosVendidos = state.servicos
    .map((s) => ({
      nome: s.nome,
      qtd: state.agendamentos.filter((a) => a.servico === s.nome && a.status === 'finalizado').length,
    }))
    .filter((s) => s.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5)

  const receitaDiaria = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().slice(0, 10)
    const valor = state.vendas
      .filter((v) => v.createdAt.startsWith(iso))
      .reduce((s, v) => s + v.valor, 0)
    return { dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }), valor }
  })

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        subtitle={`Hoje · ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        action={
          <Link to="/agendamentos" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-surface hover:bg-brand-deep">
            Novo agendamento
          </Link>
        }
      />

      {/* Ocupação em tempo real */}
      <Card className="mb-6">
        <h2 className="font-display text-xl tracking-wide text-brand">Ocupação agora</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {state.barbeiros.filter((b) => b.ativo).map((b) => {
            const emAtendimento = doDia.find((a) => a.barbeiro === b.nome && a.status === 'em_atendimento')
            const status = emAtendimento ? 'ocupada' : 'livre'
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3">
                <div className={`h-3 w-3 rounded-full ${status === 'ocupada' ? 'bg-brand animate-pulse' : 'bg-ok'}`} />
                <div>
                  <p className="font-medium">{b.nome}</p>
                  <p className="text-xs text-ink-muted">
                    {status === 'ocupada' ? `Atendendo ${emAtendimento?.clienteNome}` : 'Cadeira livre'}
                  </p>
                </div>
              </div>
            )
          })}
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3">
            <p className="text-sm text-ink-muted">{kpis.horariosLivres} horários livres hoje</p>
          </div>
        </div>
      </Card>

      {/* KPIs do dia */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Agendados hoje" value={String(doDia.length)} />
        <StatCard label="Confirmados" value={String(kpis.confirmados)} />
        <StatCard label="Finalizados" value={String(kpis.finalizados)} />
        <StatCard label="Cancelamentos" value={String(kpis.cancelamentos)} />
      </div>

      {/* Financeiro */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recebido hoje" value={kpis.receitaHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
        <StatCard label="Recebido na semana" value={kpis.receitaSemana.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <StatCard label="Recebido no mês" value={kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
        <StatCard label="Ticket médio" value={kpis.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub={`Tempo médio: ${kpis.tempoMedioMinutos} min`} />
      </div>

      {/* Meta */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl tracking-wide">Meta do mês</h2>
            <p className="text-sm text-ink-muted">
              {kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {kpis.metaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <span className="font-display text-3xl text-brand">{progressoMeta}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progressoMeta}%` }} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Próximos */}
        <Card>
          <h2 className="font-display text-xl tracking-wide">Agenda de hoje</h2>
          <ul className="mt-4 divide-y divide-line">
            {doDia.length === 0 && <li className="py-4 text-sm text-ink-muted">Nenhum agendamento hoje.</li>}
            {doDia.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{a.clienteNome}</p>
                  <p className="text-sm text-ink-muted">{a.hora} · {a.servico} · {a.barbeiro}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand">R$ {a.valor.toFixed(2)}</span>
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Gráficos */}
        <Card>
          <h2 className="font-display text-xl tracking-wide">Receita diária (7 dias)</h2>
          <div className="mt-4">
            <BarChart data={receitaDiaria} labelKey="dia" valueKey="valor" />
          </div>
        </Card>
      </div>

      {servicosVendidos.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-display text-xl tracking-wide">Serviços mais vendidos</h2>
          <ul className="mt-4 space-y-2">
            {servicosVendidos.map((s) => (
              <li key={s.nome} className="flex justify-between text-sm">
                <span>{s.nome}</span>
                <span className="text-brand">{s.qtd} atendimentos</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
