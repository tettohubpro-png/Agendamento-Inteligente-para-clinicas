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
  barbeariaConfig,
  clientesFromAgendamentos,
  type Agendamento,
  type BarbeariaConfig,
  type Barbeiro,
  type Cliente,
  type StatusAgendamento,
} from '../data/barbeariaConfig'
import {
  createAgendamento,
  deleteAgendamento,
  listAgendamentos,
  updateAgendamento,
  type CreateAgendamentoInput,
} from '../lib/calendarApi'

type BarbeariaContextValue = {
  clientes: Cliente[]
  agendamentos: Agendamento[]
  barbearia: BarbeariaConfig
  loading: boolean
  error: string
  refresh: () => Promise<void>
  addCliente: (c: Omit<Cliente, 'id'>) => void
  addAgendamento: (a: CreateAgendamentoInput) => Promise<void>
  updateAgendamentoStatus: (agendamento: Agendamento, status: StatusAgendamento) => Promise<void>
  cancelAgendamento: (agendamento: Agendamento) => Promise<void>
  updateBarbearia: (data: Partial<BarbeariaConfig>) => void
}

const BarbeariaContext = createContext<BarbeariaContextValue | null>(null)

function rangeWindow() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 7)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  end.setDate(end.getDate() + 60)
  return { timeMin: start.toISOString(), timeMax: end.toISOString() }
}

export function BarbeariaProvider({ children }: { children: ReactNode }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [extraClientes, setExtraClientes] = useState<Cliente[]>([])
  const [barbearia, setBarbearia] = useState(barbeariaConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { timeMin, timeMax } = rangeWindow()
      const items = await listAgendamentos({ timeMin, timeMax, barbeiro: 'todos' })
      setAgendamentos(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar agenda')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const clientes = useMemo(() => {
    const fromEvents = clientesFromAgendamentos(agendamentos)
    const map = new Map(fromEvents.map((c) => [c.id, c]))
    for (const c of extraClientes) {
      if (!map.has(c.id)) map.set(c.id, c)
    }
    return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [agendamentos, extraClientes])

  const value = useMemo<BarbeariaContextValue>(
    () => ({
      clientes,
      agendamentos,
      barbearia,
      loading,
      error,
      refresh,
      addCliente: (c) => {
        const id = c.email || c.telefone || `c${Date.now()}`
        setExtraClientes((prev) => {
          if (prev.some((x) => x.id === id || x.email === c.email)) return prev
          return [...prev, { ...c, id }]
        })
      },
      addAgendamento: async (input) => {
        await createAgendamento(input)
        await refresh()
      },
      updateAgendamentoStatus: async (agendamento, status) => {
        await updateAgendamento({
          id: agendamento.id,
          calendarId: agendamento.calendarId,
          nome: agendamento.clienteNome,
          telefone: agendamento.clienteTelefone,
          email: agendamento.clienteEmail,
          barbeiro: agendamento.barbeiro,
          servico: agendamento.servico,
          valor: agendamento.valor,
          data: agendamento.data,
          hora: agendamento.hora,
          status,
        })
        await refresh()
      },
      cancelAgendamento: async (agendamento) => {
        await deleteAgendamento({
          id: agendamento.id,
          calendarId: agendamento.calendarId,
          barbeiro: agendamento.barbeiro,
        })
        await refresh()
      },
      updateBarbearia: (data) => setBarbearia((prev) => ({ ...prev, ...data })),
    }),
    [clientes, agendamentos, barbearia, loading, error, refresh],
  )

  return <BarbeariaContext.Provider value={value}>{children}</BarbeariaContext.Provider>
}

export function useBarbearia() {
  const ctx = useContext(BarbeariaContext)
  if (!ctx) throw new Error('useBarbearia deve ser usado dentro de BarbeariaProvider')
  return ctx
}

export type { Barbeiro, StatusAgendamento, Agendamento }
