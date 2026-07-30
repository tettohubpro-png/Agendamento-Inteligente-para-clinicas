import type {
  Agendamento,
  AgendamentoStatus,
  Barbeiro,
  Caixa,
  Cliente,
  Comissao,
  EmpresaConfig,
  ErpState,
  FormaPagamento,
  Notificacao,
  Produto,
  Servico,
  Usuario,
  Venda,
} from '../types/erp'

const STORAGE_KEY = 'bomcorte_erp_v1'

function uid() {
  return crypto.randomUUID()
}

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

function seedEmpresa(): EmpresaConfig {
  return {
    nome: 'BOMCORTE',
    slogan: 'Estilo e precisão em cada corte',
    endereco: 'São Luís — MA',
    telefone: '(98) 99233-1897',
    whatsapp: '98 99233-1897',
    whatsappLink: 'https://wa.me/5598992331897?text=Olá!%20Quero%20agendar%20um%20horário%20na%20BOMCORTE',
    email: 'contato@bomcorte.com.br',
    pix: '',
    banco: '',
    horarioAbertura: '08:30',
    horarioFim: '18:00',
    metaMensal: 15000,
    pagamentos: ['PIX', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito'],
  }
}

function seedBarbeiros(): Barbeiro[] {
  return [{
    id: 'barbeiro-maycon',
    nome: 'Maycon',
    cargo: 'Barbeiro',
    horarioInicio: '08:30',
    horarioFim: '18:00',
    diasFolga: [],
    comissaoPercentual: 50,
    calendarId: 'primary',
    ativo: true,
  }]
}

function seedServicos(): Servico[] {
  return [
    { id: 's1', nome: 'Combo Essencial', descricao: 'Corte + Barba + Lavagem', duracaoMinutos: 30, valor: 70, comissaoPercentual: 50, tipo: 'combo', ativo: true },
    { id: 's2', nome: 'Combo Black', descricao: 'Corte + Barba + Lavagem + Sobrancelha', duracaoMinutos: 30, valor: 85, comissaoPercentual: 50, tipo: 'combo', ativo: true },
    { id: 's3', nome: 'Combo Premium', descricao: 'Corte + Barba + Lavagem + Sobrancelha + Máscara facial', duracaoMinutos: 45, valor: 110, comissaoPercentual: 50, tipo: 'combo', ativo: true },
    { id: 's4', nome: 'Corte', duracaoMinutos: 30, valor: 40, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
    { id: 's5', nome: 'Barba', duracaoMinutos: 30, valor: 40, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
    { id: 's6', nome: 'Barba pigmentada', duracaoMinutos: 30, valor: 55, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
    { id: 's7', nome: 'Sobrancelhas', duracaoMinutos: 15, valor: 15, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
    { id: 's8', nome: 'Pezinho', duracaoMinutos: 15, valor: 15, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
    { id: 's9', nome: 'Botox capilar', duracaoMinutos: 60, valor: 95, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
    { id: 's10', nome: 'Selagem', duracaoMinutos: 60, valor: 110, comissaoPercentual: 50, tipo: 'avulso', ativo: true },
  ]
}

function seedProdutos(): Produto[] {
  return [
    { id: 'p1', nome: 'Pomada modeladora', quantidade: 8, estoqueMinimo: 3, valorUnitario: 35, fornecedor: 'Distribuidora Beauty', ativo: true },
    { id: 'p2', nome: 'Shampoo profissional', quantidade: 2, estoqueMinimo: 5, valorUnitario: 48, fornecedor: 'Distribuidora Beauty', ativo: true },
    { id: 'p3', nome: 'Lâmina descartável', quantidade: 100, estoqueMinimo: 20, valorUnitario: 1.5, fornecedor: 'Barber Supply', ativo: true },
  ]
}

function seedUsuarios(): Usuario[] {
  return [
    { id: 'u1', email: 'tettohub@gmail.com', nome: 'Proprietário', role: 'proprietario', ativo: true },
    { id: 'u2', email: 'maycon@bomcorte.com.br', nome: 'Maycon', role: 'barbeiro', barbeiroId: 'barbeiro-maycon', ativo: true },
  ]
}

export function createSeedState(): ErpState {
  return {
    empresa: seedEmpresa(),
    usuarios: seedUsuarios(),
    barbeiros: seedBarbeiros(),
    servicos: seedServicos(),
    clientes: [],
    agendamentos: [],
    vendas: [],
    despesas: [],
    caixas: [],
    comissoes: [],
    produtos: seedProdutos(),
    estoqueMovimentos: [],
    notificacoes: [],
    auditoria: [],
    filaEspera: [],
  }
}

export function loadState(): ErpState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedState()
    saveState(seed)
    return seed
  }
  try {
    return { ...createSeedState(), ...JSON.parse(raw) } as ErpState
  } catch {
    return createSeedState()
  }
}

export function saveState(state: ErpState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resolveUserRole(email: string, usuarios: Usuario[]): Usuario | null {
  const found = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.ativo)
  if (found) return found
  return {
    id: uid(),
    email,
    nome: email.split('@')[0],
    role: 'proprietario',
    ativo: true,
  }
}

export function mapCalendarStatus(status: string): AgendamentoStatus {
  const map: Record<string, AgendamentoStatus> = {
    aguardando: 'agendado',
    confirmado: 'confirmado',
    cancelado: 'cancelado',
    agendado: 'agendado',
    em_atendimento: 'em_atendimento',
    finalizado: 'finalizado',
    nao_compareceu: 'nao_compareceu',
  }
  return map[status] ?? 'agendado'
}

export function mergeCalendarAgendamentos(
  local: Agendamento[],
  fromCalendar: Agendamento[],
): Agendamento[] {
  const map = new Map(local.map((a) => [a.id, a]))
  for (const cal of fromCalendar) {
    const existing = map.get(cal.id)
    map.set(cal.id, {
      ...cal,
      status: existing?.status && existing.status !== 'agendado' ? existing.status : mapCalendarStatus(cal.status),
      barbeiroId: existing?.barbeiroId ?? 'barbeiro-maycon',
      duracaoMinutos: existing?.duracaoMinutos ?? 30,
    })
  }
  return [...map.values()]
}

export function calcHorariosLivres(agendamentos: Agendamento[], data: string): number {
  const slots: string[] = []
  let total = 8 * 60 + 30
  const end = 18 * 60
  while (total < end) {
    const h = String(Math.floor(total / 60)).padStart(2, '0')
    const m = String(total % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    total += 30
  }
  const ocupados = new Set(
    agendamentos
      .filter((a) => a.data === data && !['cancelado', 'nao_compareceu'].includes(a.status))
      .map((a) => a.hora),
  )
  return slots.filter((s) => !ocupados.has(s)).length
}

export function sumVendas(vendas: Venda[], from: Date, to: Date): number {
  return vendas
    .filter((v) => {
      const d = new Date(v.createdAt)
      return d >= from && d <= to
    })
    .reduce((s, v) => s + v.valor, 0)
}

export function registrarVenda(
  state: ErpState,
  input: { agendamentoId?: string; barbeiroId: string; clienteId?: string; valor: number; formaPagamento: FormaPagamento },
  usuarioNome: string,
): ErpState {
  const caixaAberto = state.caixas.find((c) => c.status === 'aberto')
  const barbeiro = state.barbeiros.find((b) => b.id === input.barbeiroId)
  const venda: Venda = {
    id: uid(),
    ...input,
    caixaId: caixaAberto?.id,
    createdAt: new Date().toISOString(),
  }
  const comissao: Comissao = {
    id: uid(),
    barbeiroId: input.barbeiroId,
    barbeiroNome: barbeiro?.nome ?? 'Barbeiro',
    vendaId: venda.id,
    valorBruto: input.valor,
    percentual: barbeiro?.comissaoPercentual ?? 50,
    valorComissao: input.valor * ((barbeiro?.comissaoPercentual ?? 50) / 100),
    pago: false,
    createdAt: venda.createdAt,
  }
  return {
    ...state,
    vendas: [...state.vendas, venda],
    comissoes: [...state.comissoes, comissao],
    auditoria: [
      { id: uid(), usuarioId: '', usuarioNome, acao: 'venda_registrada', entidade: 'venda', entidadeId: venda.id, createdAt: venda.createdAt },
      ...state.auditoria,
    ],
  }
}

export function abrirCaixa(state: ErpState, usuarioId: string, usuarioNome: string, valorAbertura: number): ErpState {
  if (state.caixas.some((c) => c.status === 'aberto')) return state
  const caixa: Caixa = {
    id: uid(),
    usuarioId,
    usuarioNome,
    valorAbertura,
    status: 'aberto',
    abertoEm: new Date().toISOString(),
  }
  return { ...state, caixas: [...state.caixas, caixa] }
}

export function fecharCaixa(state: ErpState, caixaId: string, valorFechamento: number): ErpState {
  const caixa = state.caixas.find((c) => c.id === caixaId)
  if (!caixa) return state
  const vendasCaixa = state.vendas.filter((v) => v.caixaId === caixaId)
  const despesasCaixa = state.despesas.filter((d) => d.caixaId === caixaId)
  const entradas = vendasCaixa.reduce((s, v) => s + v.valor, 0)
  const saidas = despesasCaixa.reduce((s, d) => s + d.valor, 0)
  const esperado = caixa.valorAbertura + entradas - saidas
  return {
    ...state,
    caixas: state.caixas.map((c) =>
      c.id === caixaId
        ? { ...c, status: 'fechado' as const, valorFechamento, valorEsperado: esperado, diferenca: valorFechamento - esperado, fechadoEm: new Date().toISOString() }
        : c,
    ),
    notificacoes: [
      { id: uid(), tipo: 'fechamento_caixa', titulo: 'Caixa fechado', mensagem: `Diferença: R$ ${(valorFechamento - esperado).toFixed(2)}`, lida: false, createdAt: new Date().toISOString() },
      ...state.notificacoes,
    ],
  }
}

export function addCliente(state: ErpState, data: Omit<Cliente, 'id' | 'createdAt'>): ErpState {
  const cliente: Cliente = { ...data, id: uid(), createdAt: new Date().toISOString() }
  return { ...state, clientes: [...state.clientes, cliente] }
}

export function updateAgendamentoStatus(state: ErpState, id: string, status: AgendamentoStatus): ErpState {
  return {
    ...state,
    agendamentos: state.agendamentos.map((a) => (a.id === id ? { ...a, status } : a)),
  }
}

export function checkEstoqueBaixo(state: ErpState): Notificacao[] {
  return state.produtos
    .filter((p) => p.ativo && p.quantidade <= p.estoqueMinimo)
    .map((p) => ({
      id: uid(),
      tipo: 'estoque_baixo' as const,
      titulo: `Estoque baixo: ${p.nome}`,
      mensagem: `Restam ${p.quantidade} unidades (mínimo: ${p.estoqueMinimo})`,
      lida: false,
      createdAt: new Date().toISOString(),
    }))
}

export { hoje, uid }
