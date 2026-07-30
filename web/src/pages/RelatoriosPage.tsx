import { useErp } from '../context/ErpContext'
import { Btn, Card, PageHeader } from '../components/ui'

export function RelatoriosPage() {
  const { state, kpis } = useErp()

  function exportCsv(nome: string, rows: string[][]) {
    const csv = rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nome}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const relatorios = [
    {
      titulo: 'Receita',
      desc: 'Vendas por período',
      export: () => exportCsv('receita', [
        ['Data', 'Valor', 'Forma'],
        ...state.vendas.map((v) => [v.createdAt.slice(0, 10), String(v.valor), v.formaPagamento]),
      ]),
    },
    {
      titulo: 'Clientes',
      desc: 'Lista completa de clientes',
      export: () => exportCsv('clientes', [
        ['Nome', 'Telefone', 'Email'],
        ...state.clientes.map((c) => [c.nome, c.telefone, c.email ?? '']),
      ]),
    },
    {
      titulo: 'Barbeiros',
      desc: 'Produtividade por barbeiro',
      export: () => exportCsv('barbeiros', [
        ['Barbeiro', 'Atendimentos', 'Receita'],
        ...state.barbeiros.map((b) => {
          const atend = state.agendamentos.filter((a) => a.barbeiro === b.nome && a.status === 'finalizado')
          return [b.nome, String(atend.length), String(atend.reduce((s, a) => s + a.valor, 0))]
        }),
      ]),
    },
    {
      titulo: 'Comissões',
      desc: 'Comissões por barbeiro',
      export: () => exportCsv('comissoes', [
        ['Barbeiro', 'Faturado', 'Comissão', 'Pago'],
        ...state.comissoes.map((c) => [c.barbeiroNome, String(c.valorBruto), String(c.valorComissao), c.pago ? 'Sim' : 'Não']),
      ]),
    },
    {
      titulo: 'Despesas',
      desc: 'Saídas do período',
      export: () => exportCsv('despesas', [
        ['Data', 'Descrição', 'Valor', 'Categoria'],
        ...state.despesas.map((d) => [d.createdAt.slice(0, 10), d.descricao, String(d.valor), d.categoria ?? '']),
      ]),
    },
    {
      titulo: 'Estoque',
      desc: 'Posição atual',
      export: () => exportCsv('estoque', [
        ['Produto', 'Quantidade', 'Mínimo', 'Valor'],
        ...state.produtos.map((p) => [p.nome, String(p.quantidade), String(p.estoqueMinimo), String(p.valorUnitario)]),
      ]),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Relatórios" subtitle="Exportação em CSV (Excel) — PDF em breve" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-ink-muted">Receita mês</p><p className="text-xl text-brand">{kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></Card>
        <Card><p className="text-sm text-ink-muted">Clientes</p><p className="text-xl">{state.clientes.length}</p></Card>
        <Card><p className="text-sm text-ink-muted">Atendimentos finalizados</p><p className="text-xl">{state.agendamentos.filter((a) => a.status === 'finalizado').length}</p></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {relatorios.map((r) => (
          <Card key={r.titulo}>
            <h3 className="font-medium">{r.titulo}</h3>
            <p className="mt-1 text-sm text-ink-muted">{r.desc}</p>
            <Btn variant="secondary" onClick={r.export}>Exportar CSV</Btn>
          </Card>
        ))}
      </div>
    </div>
  )
}
