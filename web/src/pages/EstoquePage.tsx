import { useErp } from '../context/ErpContext'
import { Card, PageHeader, StatusBadge } from '../components/ui'

export function EstoquePage() {
  const { state } = useErp()
  const { produtos } = state

  const baixo = produtos.filter((p) => p.quantidade <= p.estoqueMinimo)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Estoque" subtitle="Produtos, quantidades e alertas de estoque mínimo" />

      {baixo.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          {baixo.length} produto(s) com estoque baixo: {baixo.map((p) => p.nome).join(', ')}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Valor unit.</th>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className={`px-4 py-3 ${p.quantidade <= p.estoqueMinimo ? 'text-danger font-medium' : ''}`}>
                  {p.quantidade}
                </td>
                <td className="px-4 py-3 text-ink-muted">{p.estoqueMinimo}</td>
                <td className="px-4 py-3">R$ {p.valorUnitario.toFixed(2)}</td>
                <td className="px-4 py-3 text-ink-muted">{p.fornecedor ?? '—'}</td>
                <td className="px-4 py-3">
                  {p.quantidade <= p.estoqueMinimo ? (
                    <StatusBadge status="nao_compareceu" />
                  ) : (
                    <StatusBadge status="finalizado" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-xl">Valor total em estoque</h2>
        <p className="mt-2 text-2xl text-brand">
          {produtos.reduce((s, p) => s + p.quantidade * p.valorUnitario, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </Card>
    </div>
  )
}
