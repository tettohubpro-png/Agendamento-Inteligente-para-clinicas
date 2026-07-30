export type UserRole = 'proprietario' | 'gerente' | 'barbeiro' | 'recepcionista'

export type AgendamentoStatus =
  | 'agendado'
  | 'confirmado'
  | 'em_atendimento'
  | 'finalizado'
  | 'cancelado'
  | 'nao_compareceu'

export type FormaPagamento = 'pix' | 'dinheiro' | 'debito' | 'credito'
export type CaixaStatus = 'aberto' | 'fechado'
export type MovimentoTipo = 'entrada' | 'saida'
export type CadeiraStatus = 'livre' | 'ocupada' | 'limpeza'

export type Usuario = {
  id: string
  email: string
  nome: string
  fotoUrl?: string
  role: UserRole
  barbeiroId?: string
  ativo: boolean
}

export type Barbeiro = {
  id: string
  nome: string
  fotoUrl?: string
  telefone?: string
  cargo: string
  horarioInicio: string
  horarioFim: string
  diasFolga: number[]
  comissaoPercentual: number
  calendarId?: string
  ativo: boolean
}

export type Servico = {
  id: string
  nome: string
  descricao?: string
  duracaoMinutos: number
  valor: number
  comissaoPercentual: number
  tipo: 'combo' | 'avulso'
  ativo: boolean
}

export type Cliente = {
  id: string
  nome: string
  fotoUrl?: string
  telefone: string
  whatsapp?: string
  email?: string
  dataNascimento?: string
  preferencias?: string
  alergias?: string
  observacoes?: string
  createdAt: string
}

export type Agendamento = {
  id: string
  calendarId?: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  clienteEmail?: string
  barbeiroId: string
  barbeiro: string
  servicoId?: string
  servico: string
  valor: number
  data: string
  hora: string
  duracaoMinutos: number
  status: AgendamentoStatus
  observacoes?: string
}

export type Venda = {
  id: string
  agendamentoId?: string
  barbeiroId: string
  clienteId?: string
  valor: number
  formaPagamento: FormaPagamento
  caixaId?: string
  createdAt: string
}

export type Despesa = {
  id: string
  descricao: string
  valor: number
  categoria?: string
  caixaId?: string
  createdAt: string
}

export type Caixa = {
  id: string
  usuarioId: string
  usuarioNome: string
  valorAbertura: number
  valorFechamento?: number
  valorEsperado?: number
  diferenca?: number
  status: CaixaStatus
  abertoEm: string
  fechadoEm?: string
}

export type Comissao = {
  id: string
  barbeiroId: string
  barbeiroNome: string
  vendaId: string
  valorBruto: number
  percentual: number
  valorComissao: number
  pago: boolean
  pagoEm?: string
  createdAt: string
}

export type Produto = {
  id: string
  nome: string
  quantidade: number
  estoqueMinimo: number
  valorUnitario: number
  fornecedor?: string
  ativo: boolean
}

export type EstoqueMovimento = {
  id: string
  produtoId: string
  tipo: MovimentoTipo
  quantidade: number
  observacao?: string
  createdAt: string
}

export type Notificacao = {
  id: string
  tipo: 'lembrete_agendamento' | 'estoque_baixo' | 'fechamento_caixa' | 'meta_atingida' | 'comissao_pendente'
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: string
}

export type Auditoria = {
  id: string
  usuarioId: string
  usuarioNome: string
  acao: string
  entidade: string
  entidadeId?: string
  createdAt: string
}

export type EmpresaConfig = {
  nome: string
  slogan: string
  logoUrl?: string
  endereco: string
  telefone: string
  whatsapp: string
  whatsappLink: string
  email: string
  pix: string
  banco: string
  horarioAbertura: string
  horarioFim: string
  metaMensal: number
  pagamentos: string[]
}

export type DashboardKpis = {
  agendados: number
  confirmados: number
  aguardando: number
  finalizados: number
  cancelamentos: number
  horariosLivres: number
  receitaHoje: number
  receitaSemana: number
  receitaMes: number
  metaMes: number
  ticketMedio: number
  tempoMedioMinutos: number
}

export type ErpState = {
  empresa: EmpresaConfig
  usuarios: Usuario[]
  barbeiros: Barbeiro[]
  servicos: Servico[]
  clientes: Cliente[]
  agendamentos: Agendamento[]
  vendas: Venda[]
  despesas: Despesa[]
  caixas: Caixa[]
  comissoes: Comissao[]
  produtos: Produto[]
  estoqueMovimentos: EstoqueMovimento[]
  notificacoes: Notificacao[]
  auditoria: Auditoria[]
  filaEspera: { id: string; clienteNome: string; telefone: string; servico: string; createdAt: string }[]
}
