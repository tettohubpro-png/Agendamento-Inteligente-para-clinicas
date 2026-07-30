import { getAccessToken } from './auth'
import type { Agendamento, Barbeiro, StatusAgendamento } from '../data/barbeariaConfig'

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Faça login com Google para continuar')

  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`)
  }
  return data as T
}

export async function fetchAuthConfig() {
  const res = await fetch('/api/auth-config')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao carregar config')
  return data as {
    clientId: string
    barbeiros: string[]
    calendars: Record<string, string>
  }
}

export type CreateAgendamentoInput = {
  nome: string
  telefone: string
  email: string
  barbeiro: Barbeiro
  servico: string
  valor: number
  data: string
  hora: string
  status?: StatusAgendamento
}

export async function listAgendamentos(params: {
  timeMin: string
  timeMax: string
  barbeiro?: Barbeiro | 'todos'
}) {
  const qs = new URLSearchParams({
    timeMin: params.timeMin,
    timeMax: params.timeMax,
    barbeiro: params.barbeiro || 'todos',
  })
  const data = await api<{ agendamentos: Agendamento[] }>(`calendar-list?${qs}`)
  return data.agendamentos
}

export async function createAgendamento(input: CreateAgendamentoInput) {
  const data = await api<{ agendamento: Agendamento }>('calendar-create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.agendamento
}

export async function updateAgendamento(
  input: Partial<CreateAgendamentoInput> & {
    id: string
    calendarId: string
    status?: StatusAgendamento
  },
) {
  const data = await api<{ agendamento: Agendamento }>('calendar-update', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return data.agendamento
}

export async function deleteAgendamento(input: {
  id: string
  calendarId: string
  barbeiro?: Barbeiro
}) {
  await api<{ ok: boolean }>('calendar-delete', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
