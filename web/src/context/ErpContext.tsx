import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  abrirCaixa,
  addCliente,
  checkEstoqueBaixo,
  fecharCaixa,
  hoje,
  loadState,
  mergeCalendarAgendamentos,
  registrarVenda,
  saveState,
  sumVendas,
  updateAgendamentoStatus,
  calcHorariosLivres,
} from '../lib/erpStore'
import { listAgendamentos } from '../lib/calendarApi'
import type {
  Agendamento,
  AgendamentoStatus,
  Cliente,
  DashboardKpis,
  EmpresaConfig,
  ErpState,
  FormaPagamento,
} from '../types/erp'
import type { CreateAgendamentoInput } from '../lib/calendarApi'
import { createAgendamento, deleteAgendamento, updateAgendamento } from '../lib/calendarApi'

type ErpContextValue = {
  state: ErpState
  loading: boolean
  error: string
  refresh: () => Promise<void>
  kpis: DashboardKpis
  caixaAberto: ErpState['caixas'][0] | undefined
  // Clientes
  addCliente: (c: Omit<Cliente, 'id' | 'createdAt'>) => void
  updateCliente: (id: string, data: Partial<Cliente>) => void
  // Agendamentos
  updateStatus: (id: string, status: AgendamentoStatus) => Promise<void>
  createAgendamento: (input: CreateAgendamentoInput) => Promise<void>
  cancelAgendamento: (a: Agendamento) => Promise<void>
  // Financeiro
  registrarVenda: (input: { agendamentoId?: string; barbeiroId: string; clienteId?: string; valor: number; formaPagamento: FormaPagamento }, usuarioNome: string) => void
  abrirCaixa: (usuarioId: string, usuarioNome: string, valor: number) => void
  fecharCaixa: (caixaId: string, valor: number) => void
  addDespesa: (descricao: string, valor: number, categoria?: string) => void
  // Config
  updateEmpresa: (data: Partial<EmpresaConfig>) => void
  updateUsuarios: (usuarios: ErpState['usuarios']) => void
  marcarNotificacaoLida: (id: string) => void
  persist: () => void
}

const ErpContext = createContext<ErpContextValue | null>(null)

function rangeWindow() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 7)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  end.setDate(end.getDate() + 60)
  return { timeMin: start.toISOString(), timeMax: end.toISOString() }
}

function computeKpis(state: ErpState): DashboardKpis {
  const today = hoje()
  const doDia = state.agendamentos.filter((a) => a.data === today)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const finalizados = doDia.filter((a) => a.status === 'finalizado')
  const vendasHoje = sumVendas(state.vendas, new Date(today), new Date(`${today}T23:59:59`))
  const vendasSemana = sumVendas(state.vendas, weekStart, now)
  const vendasMes = sumVendas(state.vendas, monthStart, now)
  const ticketMedio = state.vendas.length
    ? state.vendas.reduce((s, v) => s + v.valor, 0) / state.vendas.length
    : 0

  return {
    agendados: doDia.filter((a) => a.status === 'agendado').length,
    confirmados: doDia.filter((a) => a.status === 'confirmado').length,
    aguardando: doDia.filter((a) => a.status === 'agendado').length,
    finalizados: finalizados.length,
    cancelamentos: doDia.filter((a) => a.status === 'cancelado').length,
    horariosLivres: calcHorariosLivres(state.agendamentos, today),
    receitaHoje: vendasHoje,
    receitaSemana: vendasSemana,
    receitaMes: vendasMes,
    metaMes: state.empresa.metaMensal,
    ticketMedio,
    tempoMedioMinutos: 32,
  }
}

export function ErpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ErpState>(() => loadState())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const persist = useCallback(() => saveState(state), [state])

  useEffect(() => {
    saveState(state)
  }, [state])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { timeMin, timeMax } = rangeWindow()
      const fromCalendar = await listAgendamentos({ timeMin, timeMax, barbeiro: 'todos' })
      const merged = mergeCalendarAgendamentos(state.agendamentos, fromCalendar as Agendamento[])
      const estoqueNotifs = checkEstoqueBaixo({ ...state, agendamentos: merged })
      setState((prev) => ({
        ...prev,
        agendamentos: merged,
        notificacoes: [
          ...estoqueNotifs.filter((n) => !prev.notificacoes.some((p) => p.titulo === n.titulo)),
          ...prev.notificacoes,
        ],
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao sincronizar')
    } finally {
      setLoading(false)
    }
  }, [state.agendamentos])

  useEffect(() => {
    void refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const kpis = useMemo(() => computeKpis(state), [state])
  const caixaAberto = state.caixas.find((c) => c.status === 'aberto')

  const value = useMemo<ErpContextValue>(
    () => ({
      state,
      loading,
      error,
      refresh,
      kpis,
      caixaAberto,
      addCliente: (c) => setState((prev) => addCliente(prev, c)),
      updateCliente: (id, data) =>
        setState((prev) => ({
          ...prev,
          clientes: prev.clientes.map((cl) => (cl.id === id ? { ...cl, ...data } : cl)),
        })),
      updateStatus: async (id, status) => {
        const ag = state.agendamentos.find((a) => a.id === id)
        if (!ag) return
        setState((prev) => updateAgendamentoStatus(prev, id, status))
        if (status === 'cancelado') {
          await deleteAgendamento({ id: ag.id, calendarId: ag.calendarId! })
        } else {
          await updateAgendamento({
            id: ag.id,
            calendarId: ag.calendarId!,
            nome: ag.clienteNome,
            telefone: ag.clienteTelefone,
            email: ag.clienteEmail ?? '',
            barbeiro: ag.barbeiro as 'Maycon',
            servico: ag.servico,
            valor: ag.valor,
            data: ag.data,
            hora: ag.hora,
            status: status === 'confirmado' ? 'confirmado' : status === 'agendado' ? 'aguardando' : 'confirmado',
          })
        }
        if (status === 'finalizado') {
          setState((prev) =>
            registrarVenda(prev, {
              agendamentoId: ag.id,
              barbeiroId: ag.barbeiroId,
              clienteId: ag.clienteId,
              valor: ag.valor,
              formaPagamento: 'pix',
            }, 'Sistema'),
          )
        }
      },
      createAgendamento: async (input) => {
        const created = await createAgendamento(input)
        setState((prev) => ({
          ...prev,
          agendamentos: [...prev.agendamentos, { ...created, barbeiroId: 'barbeiro-maycon', duracaoMinutos: 30, status: 'agendado' } as Agendamento],
        }))
      },
      cancelAgendamento: async (a) => {
        await deleteAgendamento({ id: a.id, calendarId: a.calendarId! })
        setState((prev) => updateAgendamentoStatus(prev, a.id, 'cancelado'))
      },
      registrarVenda: (input, usuarioNome) => setState((prev) => registrarVenda(prev, input, usuarioNome)),
      abrirCaixa: (usuarioId, usuarioNome, valor) => setState((prev) => abrirCaixa(prev, usuarioId, usuarioNome, valor)),
      fecharCaixa: (caixaId, valor) => setState((prev) => fecharCaixa(prev, caixaId, valor)),
      addDespesa: (descricao, valor, categoria) =>
        setState((prev) => ({
          ...prev,
          despesas: [
            { id: crypto.randomUUID(), descricao, valor, categoria, caixaId: prev.caixas.find((c) => c.status === 'aberto')?.id, createdAt: new Date().toISOString() },
            ...prev.despesas,
          ],
        })),
      updateEmpresa: (data) => setState((prev) => ({ ...prev, empresa: { ...prev.empresa, ...data } })),
      updateUsuarios: (usuarios) => setState((prev) => ({ ...prev, usuarios })),
      marcarNotificacaoLida: (id) =>
        setState((prev) => ({
          ...prev,
          notificacoes: prev.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n)),
        })),
      persist,
    }),
    [state, loading, error, refresh, kpis, caixaAberto, persist],
  )

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>
}

export function useErp() {
  const ctx = useContext(ErpContext)
  if (!ctx) throw new Error('useErp fora de ErpProvider')
  return ctx
}
