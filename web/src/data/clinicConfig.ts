export type Medico = 'Dr. Elizeu' | 'Dr. Paulo'
export type StatusAgendamento = 'confirmado' | 'aguardando' | 'cancelado'

export type Paciente = {
  id: string
  nome: string
  telefone: string
  email: string
}

export type Agendamento = {
  id: string
  calendarId: string
  pacienteId: string
  pacienteNome: string
  pacienteTelefone: string
  pacienteEmail: string
  medico: Medico
  data: string
  hora: string
  status: StatusAgendamento
}

export type ClinicaConfig = {
  nome: string
  endereco: string
  telefone: string
  email: string
  site: string
  valorConsulta: number
  pagamentos: string[]
  convenio: string
}

export const MEDICOS: { nome: Medico; especialidade: string }[] = [
  { nome: 'Dr. Elizeu', especialidade: 'Urologista' },
  { nome: 'Dr. Paulo', especialidade: 'Oncologista' },
]

export const HORARIOS = Array.from({ length: 20 }, (_, i) => {
  const total = 8 * 60 + i * 30
  const h = String(Math.floor(total / 60)).padStart(2, '0')
  const m = String(total % 60).padStart(2, '0')
  return `${h}:${m}`
})

export const clinicaConfig: ClinicaConfig = {
  nome: 'Consultório Médico Boa Saúde',
  endereco: 'Rua Formoso, número 100, Setor America, CEP 00.000-000',
  telefone: '(11) 00000-0000',
  email: 'contato@consultorioboaforma.com.br',
  site: 'www.consultorioboaforma.com.br',
  valorConsulta: 600,
  pagamentos: ['PIX', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito'],
  convenio: 'Unimed',
}

export function pacientePorId(lista: Paciente[], id: string) {
  return lista.find((p) => p.id === id)
}

export function pacientesFromAgendamentos(agendamentos: Agendamento[]): Paciente[] {
  const map = new Map<string, Paciente>()
  for (const a of agendamentos) {
    const id = a.pacienteEmail || a.pacienteTelefone || a.pacienteId
    if (!map.has(id)) {
      map.set(id, {
        id,
        nome: a.pacienteNome,
        telefone: a.pacienteTelefone,
        email: a.pacienteEmail,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
