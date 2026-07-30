import { useErp } from '../context/ErpContext'
import { useAuth } from '../context/AuthContext'
import { Card, PageHeader, StatCard, StatusBadge } from '../components/ui'

export function ComissoesPage() {
  const { state } = useErp()
  const { usuario } = useAuth()
  const { comissoes, barbeiros } = state

  const lista = usuario?.role === 'barbeiro' && usuario.barbeiroId
    ? comissoes.filter((c) => c.barbeiroId === usuario.barbeiroId)
    : comissoes

  const pendentes = lista.filter((c) => !c.pago)
  const totalPendente = pendentes.reduce((s, c) => s + c.valorComissao, 0)
  const totalPago = lista.filter((c) => c.pago).reduce((s, c) => s + c.valorComissao, 0)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Comissões" subtitle="Cálculo automático por atendimento finalizado" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Comissões pendentes" value={totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
        <StatCard label="Comissões pagas" value={totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <StatCard label="Atendimentos" value={String(lista.length)} />
      </div>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="px-4 py-3">Barbeiro</th>
                <th className="px-4 py-3">Faturado</th>
                <th className="px-4 py-3">%</th>
                <th className="px-4 py-3">Comissão</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-ink-muted">Nenhuma comissão ainda. Finalize atendimentos para gerar.</td></tr>
              )}
              {lista.map((c) => (
                <tr key={c.id} className="border-b border-line/70">
                  <td className="px-4 py-3 font-medium">{c.barbeiroNome}</td>
                  <td className="px-4 py-3">R$ {c.valorBruto.toFixed(2)}</td>
                  <td className="px-4 py-3">{c.percentual}%</td>
                  <td className="px-4 py-3 text-brand">R$ {c.valorComissao.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.pago ? 'finalizado' : 'agendado'} /></td>
                  <td className="px-4 py-3 text-ink-muted">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {barbeiros.map((b) => {
          const doBarbeiro = comissoes.filter((c) => c.barbeiroId === b.id)
          const total = doBarbeiro.reduce((s, c) => s + c.valorComissao, 0)
          return (
            <Card key={b.id}>
              <h3 className="font-medium">{b.nome}</h3>
              <p className="mt-1 text-2xl text-brand">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-ink-muted">{doBarbeiro.length} atendimentos · {b.comissaoPercentual}%</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
