import { useState } from 'react'
import { useErp } from '../context/ErpContext'
import { useAuth } from '../context/AuthContext'
import { Btn, Card, PageHeader, StatCard, StatusBadge } from '../components/ui'

export function CaixaPage() {
  const { state, caixaAberto, abrirCaixa, fecharCaixa, addDespesa } = useErp()
  const { usuario } = useAuth()
  const [valorAbertura, setValorAbertura] = useState('50')
  const [valorFechamento, setValorFechamento] = useState('')
  const [despesaDesc, setDespesaDesc] = useState('')
  const [despesaValor, setDespesaValor] = useState('')

  const vendasCaixa = caixaAberto
    ? state.vendas.filter((v) => v.caixaId === caixaAberto.id)
    : []
  const despesasCaixa = caixaAberto
    ? state.despesas.filter((d) => d.caixaId === caixaAberto.id)
    : []
  const entradas = vendasCaixa.reduce((s, v) => s + v.valor, 0)
  const saidas = despesasCaixa.reduce((s, d) => s + d.valor, 0)
  const saldo = (caixaAberto?.valorAbertura ?? 0) + entradas - saidas

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Caixa"
        subtitle="Abertura, vendas, despesas e fechamento diário"
        action={caixaAberto ? <StatusBadge status="aberto" /> : <StatusBadge status="fechado" />}
      />

      {!caixaAberto ? (
        <Card>
          <h2 className="font-display text-xl">Abrir caixa</h2>
          <p className="mt-1 text-sm text-ink-muted">Informe o valor inicial em dinheiro no caixa.</p>
          <div className="mt-4 flex gap-3">
            <input
              type="number"
              className="rounded-xl border border-line bg-surface px-3 py-2"
              value={valorAbertura}
              onChange={(e) => setValorAbertura(e.target.value)}
            />
            <Btn onClick={() => abrirCaixa(usuario?.id ?? '', usuario?.nome ?? 'Usuário', Number(valorAbertura))}>
              Abrir caixa
            </Btn>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Abertura" value={`R$ ${caixaAberto.valorAbertura.toFixed(2)}`} />
            <StatCard label="Entradas" value={entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
            <StatCard label="Saídas" value={saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <StatCard label="Saldo atual" value={saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} accent />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-xl">Registrar despesa</h2>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-line bg-surface px-3 py-2" placeholder="Descrição" value={despesaDesc} onChange={(e) => setDespesaDesc(e.target.value)} />
                <input type="number" className="w-full rounded-xl border border-line bg-surface px-3 py-2" placeholder="Valor" value={despesaValor} onChange={(e) => setDespesaValor(e.target.value)} />
                <Btn onClick={() => { addDespesa(despesaDesc, Number(despesaValor)); setDespesaDesc(''); setDespesaValor('') }}>Registrar</Btn>
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-xl">Fechar caixa</h2>
              <p className="mt-1 text-sm text-ink-muted">Saldo esperado: {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <div className="mt-4 flex gap-3">
                <input type="number" className="rounded-xl border border-line bg-surface px-3 py-2" placeholder="Valor contado" value={valorFechamento} onChange={(e) => setValorFechamento(e.target.value)} />
                <Btn onClick={() => fecharCaixa(caixaAberto.id, Number(valorFechamento))}>Fechar</Btn>
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <h2 className="font-display text-xl">Movimentações do caixa</h2>
            <ul className="mt-4 divide-y divide-line">
              {vendasCaixa.map((v) => (
                <li key={v.id} className="flex justify-between py-2 text-sm">
                  <span>Venda · {v.formaPagamento}</span>
                  <span className="text-emerald-300">+ R$ {v.valor.toFixed(2)}</span>
                </li>
              ))}
              {despesasCaixa.map((d) => (
                <li key={d.id} className="flex justify-between py-2 text-sm">
                  <span>{d.descricao}</span>
                  <span className="text-danger">- R$ {d.valor.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <Card className="mt-6">
        <h2 className="font-display text-xl">Histórico de caixas</h2>
        <ul className="mt-4 divide-y divide-line">
          {state.caixas.filter((c) => c.status === 'fechado').map((c) => (
            <li key={c.id} className="flex justify-between py-3 text-sm">
              <span>{new Date(c.abertoEm).toLocaleDateString('pt-BR')} · {c.usuarioNome}</span>
              <span>
                Esperado: R$ {c.valorEsperado?.toFixed(2)} · Diferença:{' '}
                <span className={c.diferenca && c.diferenca !== 0 ? 'text-danger' : 'text-ok'}>
                  R$ {c.diferenca?.toFixed(2)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
