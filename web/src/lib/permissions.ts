import type { UserRole } from '../types/erp'

export type { UserRole }

export type Permission =
  | 'dashboard:view'
  | 'clientes:view'
  | 'clientes:edit'
  | 'agendamentos:view'
  | 'agendamentos:edit'
  | 'barbeiros:view'
  | 'barbeiros:edit'
  | 'servicos:view'
  | 'servicos:edit'
  | 'financeiro:view'
  | 'financeiro:edit'
  | 'comissoes:view'
  | 'comissoes:edit'
  | 'caixa:view'
  | 'caixa:edit'
  | 'estoque:view'
  | 'estoque:edit'
  | 'relatorios:view'
  | 'relatorios:export'
  | 'config:view'
  | 'config:edit'
  | 'usuarios:edit'
  | 'ia:view'
  | 'auditoria:view'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  proprietario: [
    'dashboard:view', 'clientes:view', 'clientes:edit', 'agendamentos:view', 'agendamentos:edit',
    'barbeiros:view', 'barbeiros:edit', 'servicos:view', 'servicos:edit',
    'financeiro:view', 'financeiro:edit', 'comissoes:view', 'comissoes:edit',
    'caixa:view', 'caixa:edit', 'estoque:view', 'estoque:edit',
    'relatorios:view', 'relatorios:export', 'config:view', 'config:edit',
    'usuarios:edit', 'ia:view', 'auditoria:view',
  ],
  gerente: [
    'dashboard:view', 'clientes:view', 'clientes:edit', 'agendamentos:view', 'agendamentos:edit',
    'barbeiros:view', 'servicos:view', 'financeiro:view', 'comissoes:view', 'comissoes:edit',
    'caixa:view', 'caixa:edit', 'estoque:view', 'estoque:edit',
    'relatorios:view', 'relatorios:export', 'ia:view',
  ],
  barbeiro: [
    'dashboard:view', 'clientes:view', 'agendamentos:view', 'agendamentos:edit',
    'comissoes:view', 'servicos:view',
  ],
  recepcionista: [
    'dashboard:view', 'clientes:view', 'clientes:edit', 'agendamentos:view', 'agendamentos:edit',
    'caixa:view', 'caixa:edit', 'servicos:view',
  ],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  proprietario: 'Proprietário',
  gerente: 'Gerente',
  barbeiro: 'Barbeiro',
  recepcionista: 'Recepcionista',
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export type NavItem = {
  to: string
  label: string
  permission: Permission
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', permission: 'dashboard:view' },
  { to: '/agenda', label: 'Agenda', permission: 'agendamentos:view' },
  { to: '/agendamentos', label: 'Agendamentos', permission: 'agendamentos:view' },
  { to: '/clientes', label: 'Clientes', permission: 'clientes:view' },
  { to: '/barbeiros', label: 'Barbeiros', permission: 'barbeiros:view' },
  { to: '/servicos', label: 'Serviços', permission: 'servicos:view' },
  { to: '/financeiro', label: 'Financeiro', permission: 'financeiro:view' },
  { to: '/comissoes', label: 'Comissões', permission: 'comissoes:view' },
  { to: '/caixa', label: 'Caixa', permission: 'caixa:view' },
  { to: '/estoque', label: 'Estoque', permission: 'estoque:view' },
  { to: '/relatorios', label: 'Relatórios', permission: 'relatorios:view' },
  { to: '/ia', label: 'IA Interna', permission: 'ia:view' },
  { to: '/configuracoes', label: 'Configurações', permission: 'config:view' },
]

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => hasPermission(role, item.permission))
}
