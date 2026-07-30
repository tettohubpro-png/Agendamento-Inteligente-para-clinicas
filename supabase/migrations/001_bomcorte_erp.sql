-- BOMCORTE ERP — schema completo
-- Execute no Supabase SQL Editor ou via CLI

create extension if not exists "uuid-ossp";

-- Papéis
create type user_role as enum ('proprietario', 'gerente', 'barbeiro', 'recepcionista');
create type agendamento_status as enum (
  'agendado', 'confirmado', 'em_atendimento', 'finalizado', 'cancelado', 'nao_compareceu'
);
create type forma_pagamento as enum ('pix', 'dinheiro', 'debito', 'credito');
create type caixa_status as enum ('aberto', 'fechado');
create type movimento_tipo as enum ('entrada', 'saida');
create type notificacao_tipo as enum (
  'lembrete_agendamento', 'estoque_baixo', 'fechamento_caixa', 'meta_atingida', 'comissao_pendente'
);

-- Empresa
create table empresas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null default 'BOMCORTE',
  slogan text,
  logo_url text,
  endereco text,
  telefone text,
  whatsapp text,
  email text,
  pix text,
  banco text,
  horario_abertura time default '08:30',
  horario_fechamento time default '18:00',
  dias_funcionamento int[] default '{1,2,3,4,5,6}',
  meta_mensal numeric(12,2) default 15000,
  created_at timestamptz default now()
);

-- Usuários do sistema (vinculados ao Google Auth)
create table usuarios (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  email text unique not null,
  nome text not null,
  foto_url text,
  role user_role not null default 'recepcionista',
  barbeiro_id uuid,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Barbeiros
create table barbeiros (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  foto_url text,
  telefone text,
  cargo text default 'Barbeiro',
  horario_inicio time default '08:30',
  horario_fim time default '18:00',
  dias_folga int[] default '{}',
  comissao_percentual numeric(5,2) default 50,
  calendar_id text,
  ativo boolean default true,
  created_at timestamptz default now()
);

alter table usuarios add constraint fk_usuario_barbeiro
  foreign key (barbeiro_id) references barbeiros(id) on delete set null;

-- Serviços
create table servicos (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  descricao text,
  duracao_minutos int default 30,
  valor numeric(10,2) not null,
  comissao_percentual numeric(5,2) default 50,
  tipo text default 'avulso',
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Clientes
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  foto_url text,
  telefone text,
  whatsapp text,
  email text,
  data_nascimento date,
  preferencias text,
  alergias text,
  observacoes text,
  created_at timestamptz default now()
);

-- Agendamentos
create table agendamentos (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete set null,
  barbeiro_id uuid references barbeiros(id) on delete set null,
  servico_id uuid references servicos(id) on delete set null,
  calendar_event_id text,
  data date not null,
  hora time not null,
  duracao_minutos int default 30,
  valor numeric(10,2) not null,
  status agendamento_status default 'agendado',
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vendas / recebimentos
create table vendas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  agendamento_id uuid references agendamentos(id) on delete set null,
  barbeiro_id uuid references barbeiros(id),
  cliente_id uuid references clientes(id),
  valor numeric(10,2) not null,
  forma_pagamento forma_pagamento not null,
  caixa_id uuid,
  created_at timestamptz default now()
);

-- Caixa
create table caixas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  usuario_id uuid references usuarios(id),
  valor_abertura numeric(12,2) default 0,
  valor_fechamento numeric(12,2),
  valor_esperado numeric(12,2),
  diferenca numeric(12,2),
  status caixa_status default 'aberto',
  aberto_em timestamptz default now(),
  fechado_em timestamptz
);

alter table vendas add constraint fk_venda_caixa
  foreign key (caixa_id) references caixas(id) on delete set null;

-- Despesas
create table despesas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  descricao text not null,
  valor numeric(10,2) not null,
  categoria text,
  caixa_id uuid references caixas(id),
  created_at timestamptz default now()
);

-- Comissões
create table comissoes (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  barbeiro_id uuid references barbeiros(id) on delete cascade,
  venda_id uuid references vendas(id) on delete cascade,
  valor_bruto numeric(10,2) not null,
  percentual numeric(5,2) not null,
  valor_comissao numeric(10,2) not null,
  pago boolean default false,
  pago_em timestamptz,
  created_at timestamptz default now()
);

-- Estoque
create table produtos (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  quantidade numeric(10,2) default 0,
  estoque_minimo numeric(10,2) default 5,
  valor_unitario numeric(10,2) default 0,
  fornecedor text,
  ativo boolean default true,
  created_at timestamptz default now()
);

create table estoque_movimentos (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) on delete cascade,
  tipo movimento_tipo not null,
  quantidade numeric(10,2) not null,
  observacao text,
  usuario_id uuid references usuarios(id),
  created_at timestamptz default now()
);

-- Notificações
create table notificacoes (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  usuario_id uuid references usuarios(id),
  tipo notificacao_tipo not null,
  titulo text not null,
  mensagem text,
  lida boolean default false,
  created_at timestamptz default now()
);

-- Auditoria
create table auditoria (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references empresas(id) on delete cascade,
  usuario_id uuid references usuarios(id),
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  dados_anteriores jsonb,
  dados_novos jsonb,
  created_at timestamptz default now()
);

-- Índices
create index idx_agendamentos_data on agendamentos(data, hora);
create index idx_agendamentos_status on agendamentos(status);
create index idx_vendas_created on vendas(created_at);
create index idx_clientes_telefone on clientes(telefone);

-- RLS (habilitar em produção)
alter table empresas enable row level security;
alter table usuarios enable row level security;
alter table barbeiros enable row level security;
alter table servicos enable row level security;
alter table clientes enable row level security;
alter table agendamentos enable row level security;
alter table vendas enable row level security;
alter table caixas enable row level security;
alter table despesas enable row level security;
alter table comissoes enable row level security;
alter table produtos enable row level security;
alter table notificacoes enable row level security;

-- Seed BOMCORTE
insert into empresas (nome, slogan, telefone, whatsapp, endereco, meta_mensal)
values ('BOMCORTE', 'Estilo e precisão em cada corte', '(98) 99233-1897', '98992331897', 'São Luís — MA', 15000);

insert into barbeiros (empresa_id, nome, cargo, calendar_id, comissao_percentual)
select id, 'Maycon', 'Barbeiro', 'primary', 50 from empresas limit 1;

insert into servicos (empresa_id, nome, descricao, duracao_minutos, valor, tipo) 
select id, unnest(array['Combo Essencial','Combo Black','Combo Premium','Corte','Barba','Barba pigmentada','Sobrancelhas','Pezinho','Botox capilar','Selagem']),
       unnest(array['Corte + Barba + Lavagem','Corte + Barba + Lavagem + Sobrancelha','Corte + Barba + Lavagem + Sobrancelha + Máscara facial','','','','','','','']),
       30,
       unnest(array[70,85,110,40,40,55,15,15,95,110]::numeric[]),
       unnest(array['combo','combo','combo','avulso','avulso','avulso','avulso','avulso','avulso','avulso'])
from empresas limit 1;
