export type Barbeiro = string
export type StatusAgendamento = 'confirmado' | 'aguardando' | 'cancelado'

export type Cliente = {
  id: string
  nome: string
  telefone: string
  email: string
}

export type Agendamento = {
  id: string
  calendarId: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  clienteEmail: string
  barbeiro: Barbeiro
  servico: string
  valor: number
  data: string
  hora: string
  status: StatusAgendamento
}

export type BarbeariaConfig = {
  nome: string
  slogan: string
  endereco: string
  telefone: string
  whatsapp: string
  whatsappLink: string
  email: string
  instagram: string
  horario: string
  pagamentos: string[]
}

export type Servico = {
  id: string
  nome: string
  preco: number
  tipo: 'combo' | 'avulso'
  descricao?: string
}

export const BARBEIROS: { nome: Barbeiro; cargo: string }[] = [
  { nome: 'Maycon', cargo: 'Barbeiro' },
]

export const SERVICOS: Servico[] = [
  { id: 'combo-essencial', nome: 'Combo Essencial', preco: 70, tipo: 'combo', descricao: 'Corte + Barba + Lavagem' },
  { id: 'combo-black', nome: 'Combo Black', preco: 85, tipo: 'combo', descricao: 'Corte + Barba + Lavagem + Sobrancelha' },
  { id: 'combo-premium', nome: 'Combo Premium', preco: 110, tipo: 'combo', descricao: 'Corte + Barba + Lavagem + Sobrancelha + Máscara facial hidratante' },
  { id: 'corte', nome: 'Corte', preco: 40, tipo: 'avulso' },
  { id: 'barba', nome: 'Barba', preco: 40, tipo: 'avulso' },
  { id: 'barba-pigmentada', nome: 'Barba pigmentada', preco: 55, tipo: 'avulso' },
  { id: 'sobrancelha', nome: 'Sobrancelhas', preco: 15, tipo: 'avulso' },
  { id: 'pezinho', nome: 'Pezinho', preco: 15, tipo: 'avulso' },
  { id: 'botox', nome: 'Botox capilar', preco: 95, tipo: 'avulso' },
  { id: 'selagem', nome: 'Selagem', preco: 110, tipo: 'avulso' },
]

export const COMBOS = SERVICOS.filter((s) => s.tipo === 'combo')
export const SERVICOS_AVULSOS = SERVICOS.filter((s) => s.tipo === 'avulso')

export function servicoPorId(id: string) {
  return SERVICOS.find((s) => s.id === id)
}

export const HORARIOS = (() => {
  const slots: string[] = []
  let total = 8 * 60 + 30 // 08:30
  const end = 18 * 60 // 18:00
  while (total < end) {
    const h = String(Math.floor(total / 60)).padStart(2, '0')
    const m = String(total % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    total += 30
  }
  return slots
})()

export const barbeariaConfig: BarbeariaConfig = {
  nome: 'BOMCORTE',
  slogan: 'Estilo e precisão em cada corte',
  endereco: 'São Luís — MA',
  telefone: '(98) 99233-1897',
  whatsapp: '98 99233-1897',
  whatsappLink: 'https://wa.me/5598992331897?text=Olá!%20Quero%20agendar%20um%20horário%20na%20BOMCORTE',
  email: 'contato@bomcorte.com.br',
  instagram: '@bomcorte',
  horario: 'Segunda a sábado, 08:30 às 18:00',
  pagamentos: ['PIX', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito'],
}

export function clientePorId(lista: Cliente[], id: string) {
  return lista.find((c) => c.id === id)
}

export function clientesFromAgendamentos(agendamentos: Agendamento[]): Cliente[] {
  const map = new Map<string, Cliente>()
  for (const a of agendamentos) {
    const id = a.clienteEmail || a.clienteTelefone || a.clienteId
    if (!map.has(id)) {
      map.set(id, {
        id,
        nome: a.clienteNome,
        telefone: a.clienteTelefone,
        email: a.clienteEmail,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
