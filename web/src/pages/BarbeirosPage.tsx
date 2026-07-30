import { useErp } from '../context/ErpContext'
import { Card, PageHeader, StatCard } from '../components/ui'

export function BarbeirosPage() {
  const { state } = useErp()
  const { barbeiros, agendamentos, comissoes } = state

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Barbeiros" subtitle="Equipe, horários e indicadores de produtividade" />

      <div className="grid gap-6">
        {barbeiros.map((b) => {
          const atendimentos = agendamentos.filter((a) => a.barbeiro === b.nome && a.status === 'finalizado')
          const receita = atendimentos.reduce((s, a) => s + a.valor, 0)
          const comissaoTotal = comissoes.filter((c) => c.barbeiroId === b.id).reduce((s, c) => s + c.valorComissao, 0)

          return (
            <Card key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl tracking-wide">{b.nome}</h2>
                  <p className="text-sm text-ink-muted">{b.cargo} · {b.horarioInicio} às {b.horarioFim}</p>
                  {b.telefone && <p className="text-sm text-ink-muted">{b.telefone}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${b.ativo ? 'bg-emerald-950/60 text-emerald-300' : 'bg-surface-2 text-ink-muted'}`}>
                  {b.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <StatCard label="Clientes atendidos" value={String(atendimentos.length)} />
                <StatCard label="Receita gerada" value={receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <StatCard label="Comissão" value={comissaoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
                <StatCard label="Comissão %" value={`${b.comissaoPercentual}%`} />
              </div>

              <div className="mt-4">
                <p className="text-xs text-ink-muted">
                  Dias de folga: {b.diasFolga.length ? b.diasFolga.map((d) => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]).join(', ') : 'Nenhum'}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <h3 className="font-display text-lg">Barbeiro mais produtivo</h3>
        <p className="mt-2 text-brand">
          {barbeiros.reduce((best, b) => {
            const count = agendamentos.filter((a) => a.barbeiro === b.nome && a.status === 'finalizado').length
            const bestCount = agendamentos.filter((a) => a.barbeiro === best.nome && a.status === 'finalizado').length
            return count > bestCount ? b : best
          }, barbeiros[0])?.nome ?? '—'}
        </p>
      </Card>
    </div>
  )
}
