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
  clinicaConfig,
  pacientesFromAgendamentos,
  type Agendamento,
  type ClinicaConfig,
  type Medico,
  type Paciente,
  type StatusAgendamento,
} from '../data/clinicConfig'
import {
  createAgendamento,
  deleteAgendamento,
  listAgendamentos,
  updateAgendamento,
  type CreateAgendamentoInput,
} from '../lib/calendarApi'

type ClinicContextValue = {
  pacientes: Paciente[]
  agendamentos: Agendamento[]
  clinica: ClinicaConfig
  loading: boolean
  error: string
  refresh: () => Promise<void>
  addPaciente: (p: Omit<Paciente, 'id'>) => void
  addAgendamento: (a: CreateAgendamentoInput) => Promise<void>
  updateAgendamentoStatus: (agendamento: Agendamento, status: StatusAgendamento) => Promise<void>
  cancelAgendamento: (agendamento: Agendamento) => Promise<void>
  updateClinica: (data: Partial<ClinicaConfig>) => void
}

const ClinicContext = createContext<ClinicContextValue | null>(null)

function rangeWindow() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 7)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  end.setDate(end.getDate() + 60)
  return { timeMin: start.toISOString(), timeMax: end.toISOString() }
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [extraPacientes, setExtraPacientes] = useState<Paciente[]>([])
  const [clinica, setClinica] = useState(clinicaConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { timeMin, timeMax } = rangeWindow()
      const items = await listAgendamentos({ timeMin, timeMax, medico: 'todos' })
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

  const pacientes = useMemo(() => {
    const fromEvents = pacientesFromAgendamentos(agendamentos)
    const map = new Map(fromEvents.map((p) => [p.id, p]))
    for (const p of extraPacientes) {
      if (!map.has(p.id)) map.set(p.id, p)
    }
    return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [agendamentos, extraPacientes])

  const value = useMemo<ClinicContextValue>(
    () => ({
      pacientes,
      agendamentos,
      clinica,
      loading,
      error,
      refresh,
      addPaciente: (p) => {
        const id = p.email || p.telefone || `p${Date.now()}`
        setExtraPacientes((prev) => {
          if (prev.some((x) => x.id === id || x.email === p.email)) return prev
          return [...prev, { ...p, id }]
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
          nome: agendamento.pacienteNome,
          telefone: agendamento.pacienteTelefone,
          email: agendamento.pacienteEmail,
          medico: agendamento.medico,
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
          medico: agendamento.medico,
        })
        await refresh()
      },
      updateClinica: (data) => setClinica((prev) => ({ ...prev, ...data })),
    }),
    [pacientes, agendamentos, clinica, loading, error, refresh],
  )

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic() {
  const ctx = useContext(ClinicContext)
  if (!ctx) throw new Error('useClinic deve ser usado dentro de ClinicProvider')
  return ctx
}

export type { Medico, StatusAgendamento, Agendamento }
