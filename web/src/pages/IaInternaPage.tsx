import { useState } from 'react'
import { useErp } from '../context/ErpContext'
import { calcHorariosLivres } from '../lib/erpStore'
import { Btn, Card, PageHeader } from '../components/ui'

type Msg = { role: 'user' | 'assistant'; text: string }

function responder(pergunta: string, erp: ReturnType<typeof useErp>): string {
  const { state, kpis } = erp
  const q = pergunta.toLowerCase()

  if (q.includes('fatur') && q.includes('mês')) {
    return `Faturamos ${kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} este mês. Meta: ${kpis.metaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${Math.round((kpis.receitaMes / kpis.metaMes) * 100)}%).`
  }
  if (q.includes('barbeiro') && (q.includes('mais') || q.includes('atendeu'))) {
    const counts = state.barbeiros.map((b) => ({
      nome: b.nome,
      qtd: state.agendamentos.filter((a) => a.barbeiro === b.nome && a.status === 'finalizado').length,
    }))
    const top = counts.sort((a, b) => b.qtd - a.qtd)[0]
    return top ? `${top.nome} atendeu mais clientes: ${top.qtd} atendimentos finalizados.` : 'Sem dados ainda.'
  }
  if (q.includes('serviço') && q.includes('vendido')) {
    const map = new Map<string, number>()
    state.agendamentos.filter((a) => a.status === 'finalizado').forEach((a) => {
      map.set(a.servico, (map.get(a.servico) ?? 0) + 1)
    })
    const top = [...map.entries()].sort((a, b) => b[1] - a[1])[0]
    return top ? `O serviço mais vendido é "${top[0]}" com ${top[1]} atendimentos.` : 'Ainda não há atendimentos finalizados.'
  }
  if (q.includes('horário') && q.includes('livre')) {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    const iso = amanha.toISOString().slice(0, 10)
    const livres = calcHorariosLivres(state.agendamentos, iso)
    return `Amanhã (${iso}) temos ${livres} horários livres de 30 minutos.`
  }
  if (q.includes('lucro')) {
    const despesas = state.despesas.reduce((s, d) => s + d.valor, 0)
    const lucro = kpis.receitaMes - despesas
    return `Lucro líquido do mês: ${lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (receita ${kpis.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - despesas ${despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`
  }
  if (q.includes('meta')) {
    const falta = Math.max(0, kpis.metaMes - kpis.receitaMes)
    return `Para bater a meta de ${kpis.metaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, faltam ${falta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`
  }
  if (q.includes('45 dias') || q.includes('não volt')) {
    const limite = new Date()
    limite.setDate(limite.getDate() - 45)
    const inativos = state.clientes.filter((c) => {
      const ultimo = state.agendamentos
        .filter((a) => a.clienteTelefone === c.telefone && a.status === 'finalizado')
        .sort((a, b) => b.data.localeCompare(a.data))[0]
      return !ultimo || new Date(ultimo.data) < limite
    })
    return inativos.length
      ? `${inativos.length} cliente(s) sem retorno há mais de 45 dias: ${inativos.slice(0, 5).map((c) => c.nome).join(', ')}${inativos.length > 5 ? '…' : ''}.`
      : 'Todos os clientes retornaram nos últimos 45 dias.'
  }
  if (q.includes('despesa') && q.includes('aument')) {
    return 'Comparativo de despesas entre meses será disponível após acumular mais histórico. Despesas atuais: ' +
      state.despesas.reduce((s, d) => s + d.valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '.'
  }

  return 'Posso responder sobre faturamento, barbeiros, serviços, horários livres, lucro, meta e clientes inativos. Tente uma das sugestões abaixo.'
}

const SUGESTOES = [
  'Quanto faturamos este mês?',
  'Qual barbeiro atendeu mais clientes?',
  'Qual serviço foi o mais vendido?',
  'Quantos horários livres temos amanhã?',
  'Qual foi o lucro líquido deste mês?',
  'Quanto preciso faturar para bater a meta?',
  'Quais clientes não voltam há mais de 45 dias?',
]

export function IaInternaPage() {
  const erp = useErp()
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: 'Olá! Sou a IA interna da BOMCORTE. Ajudo você a entender os números da barbearia. O que deseja saber?' },
  ])
  const [input, setInput] = useState('')

  function enviar(texto?: string) {
    const pergunta = (texto ?? input).trim()
    if (!pergunta) return
    const resposta = responder(pergunta, erp)
    setMsgs((prev) => [...prev, { role: 'user', text: pergunta }, { role: 'assistant', text: resposta }])
    setInput('')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="IA Interna" subtitle="Assistente de gestão — não atende clientes, ajuda o proprietário" />

      <Card className="flex h-[60vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-2">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-brand text-surface' : 'bg-surface-2 text-ink'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          {SUGESTOES.map((s) => (
            <button key={s} type="button" onClick={() => enviar(s)} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-ink-muted hover:text-ink">
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            placeholder="Pergunte sobre faturamento, metas, barbeiros…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
          />
          <Btn onClick={() => enviar()}>Enviar</Btn>
        </div>
      </Card>
    </div>
  )
}
