# BOMCORTE — Sistema de Gestão para Barbearia

ERP completo para controlar toda a operação: do agendamento ao fechamento de caixa.

## Módulos

| # | Módulo | Rota | Papéis |
|---|--------|------|--------|
| 1 | Login (Google + RBAC) | `/login` | Todos |
| 2 | Dashboard | `/` | Todos |
| 3 | Clientes (CRM) | `/clientes` | Todos* |
| 4 | Agendamento | `/agenda`, `/agendamentos` | Todos* |
| 5 | Barbeiros | `/barbeiros` | Proprietário, Gerente |
| 6 | Serviços | `/servicos` | Todos* |
| 7 | Financeiro | `/financeiro` | Proprietário, Gerente |
| 8 | Comissões | `/comissoes` | Proprietário, Gerente, Barbeiro |
| 9 | Caixa | `/caixa` | Proprietário, Gerente, Recepcionista |
| 10 | Estoque | `/estoque` | Proprietário, Gerente |
| 11 | Relatórios | `/relatorios` | Proprietário, Gerente |
| 12 | Configurações | `/configuracoes` | Proprietário |
| 13 | IA Interna | `/ia` | Proprietário, Gerente |
| 14 | Notificações | sino no topo | Todos |

\* conforme permissões do papel

## Hierarquia de acesso

- **Proprietário** — acesso total
- **Gerente** — operação + financeiro + relatórios
- **Barbeiro** — agenda, clientes, suas comissões
- **Recepcionista** — agenda, clientes, caixa

Configure papéis em **Configurações → Usuários**.

## Canais

| Quem | Onde |
|------|------|
| **Cliente** | WhatsApp (98) 99233-1897 — agente n8n |
| **Equipe** | Painel web (Google login) |

## Estrutura

```
├── supabase/migrations/    # Schema Postgres (produção)
├── n8n/workflows/          # Agente WhatsApp autônomo
├── web/                    # ERP React + Netlify Functions
└── README.md
```

## Fluxo operacional

```
Cliente agenda (WhatsApp)
        ↓
Recepcionista confirma (painel)
        ↓
Barbeiro inicia atendimento
        ↓
Serviço finalizado → venda registrada
        ↓
Caixa atualizado → comissão calculada
        ↓
Dashboard atualizado
```

## Rodar local

```bash
cd web
npm install
npx netlify dev
```

## Banco de dados (Supabase)

Para produção com persistência real, execute:

```bash
# supabase/migrations/001_bomcorte_erp.sql
```

O painel funciona offline com localStorage; Supabase substitui o store local quando configurado.

## Serviços e preços

### Combos
- **Combo Essencial** — Corte + Barba + Lavagem — R$ 70
- **Combo Black** — Corte + Barba + Lavagem + Sobrancelha — R$ 85
- **Combo Premium** — Corte + Barba + Lavagem + Sobrancelha + Máscara facial — R$ 110

### Avulsos
Corte R$ 40 · Barba R$ 40 · Barba pigmentada R$ 55 · Sobrancelhas R$ 15 · Pezinho R$ 15 · Botox capilar R$ 95 · Selagem R$ 110

## Horário

Segunda a sábado, **08:30 às 18:00** (slots de 30 min).

## WhatsApp do cliente

https://wa.me/5598992331897?text=Olá!%20Quero%20agendar%20um%20horário%20na%20BOMCORTE

## Google Cloud

1. OAuth Client ID (Web) com origins da Netlify e `http://localhost:8888`
2. Escopos: `openid`, `email`, `profile`, `calendar`
3. Usuários de teste: e-mails dos barbeiros

## Variáveis Netlify

- `VITE_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_ID`
- `CALENDAR_MAYCON_ID=primary`
- Para mais barbeiros: `BARBEIROS_CALENDARS={"Maycon":"primary","Nome":"calendar-id"}`

## Workflows n8n (WhatsApp autônomo)

Automação completa para a IA agendar sozinha via WhatsApp.

```bash
node scripts/build-n8n-workflows.js   # sincroniza prompt e config
```

| Workflow | Função |
|----------|--------|
| `AgendamentoAutomatico.json` | WhatsApp → agente IA → responde cliente |
| `MCP-GoogleCalendar.json` | Tools Calendar (Agendar/Listar/Cancelar Maycon) |

Guia completo de instalação: **[n8n/README.md](n8n/README.md)**
