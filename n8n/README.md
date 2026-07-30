# Automação n8n — BOMCORTE

Automação completa para o agente de WhatsApp agendar, remarcar e cancelar horários **sozinho**, usando Google Calendar como fonte da verdade.

## Arquitetura

```
WhatsApp (Evolution API)
        │
        ▼
┌───────────────────────────────┐
│  BOMCORTE - Agendamento       │  ← workflow principal
│  WhatsApp (AgendamentoAuto.)  │
│                               │
│  Webhook → IA (GPT-4o-mini)   │
│     ├── Redis (memória chat)  │
│     ├── Google Sheets (CRM)   │
│     ├── MCP Client ───────────┼──► MCP-GoogleCalendar
│     └── Gmail (confirmação)   │         │
└───────────────────────────────┘         ▼
                                   Google Calendar (Maycon)
```

## Workflows

| Arquivo | Função |
|---------|--------|
| `workflows/AgendamentoAutomatico.json` | Recebe WhatsApp, processa texto/áudio, agente IA responde |
| `workflows/MCP-GoogleCalendar.json` | Expõe tools de calendário para a IA (MCP Server) |

**Importante:** os dois workflows precisam estar **ativos** no n8n.

## Pré-requisitos

1. **n8n** rodando (self-hosted ou cloud)
2. **Evolution API** com instância WhatsApp conectada
3. **Redis** para memória de conversa e debounce de mensagens
4. **OpenAI API** (modelo gpt-4o-mini)
5. **Google Cloud** com OAuth para:
   - Google Calendar (conta do Maycon)
   - Google Sheets (planilha de clientes)
   - Gmail (envio de confirmação)
6. **Planilha Google Sheets** com aba `clientes` e colunas: `Nome`, `Telefone`, `email`

## Passo a passo de instalação

### 1. Sincronizar workflows do repositório

```bash
node scripts/build-n8n-workflows.js
```

Isso injeta o prompt completo em `AgendamentoAutomatico.json` a partir de `prompts/bomcorte-agent-system.txt`.

### 2. Importar workflows no n8n

1. Abra o n8n → **Workflows** → **Import from File**
2. Importe `n8n/workflows/MCP-GoogleCalendar.json` → **Ative**
3. Importe `n8n/workflows/AgendamentoAutomatico.json` → configure credenciais → **Ative**

### 3. Configurar credenciais no n8n

| Credencial | Usado em |
|------------|----------|
| Evolution API | Webhook WhatsApp, envio de mensagens |
| OpenAI API | Agente IA + transcrição de áudio |
| Redis | Memória do chat + debounce |
| Google Calendar OAuth2 | MCP-GoogleCalendar |
| Google Sheets OAuth2 | Buscar/Cadastrar cliente |
| Gmail OAuth2 | E-mail de confirmação |

### 4. Google Calendar (Maycon)

No workflow **MCP-GoogleCalendar**, em cada nó de calendário, selecione o calendário do Maycon (ex.: `primary` ou e-mail do Gmail dele).

Edite `n8n/config/bomcorte.json` se o e-mail mudar:

```json
"barbeiros": [
  { "nome": "Maycon", "calendarId": "primary", "calendarEmail": "maycon@gmail.com" }
]
```

Depois rode `node scripts/build-n8n-workflows.js` novamente.

### 5. Planilha de clientes

1. Crie uma planilha no Google Sheets
2. Aba `clientes` com colunas: `Nome` | `Telefone` | `email`
3. Modelo em `templates/planilha-clientes.csv`
4. Nos nós **Buscar cadastro** e **Cadastro novo**, selecione sua planilha

### 6. Evolution API — Webhook

Na instância `Agendamento` (ou o nome em `config/bomcorte.json`):

1. Configure webhook apontando para a URL do n8n:
   ```
   https://SEU-N8N/webhook/5c59205e-9ee4-4baf-b198-848cdf5db9dc
   ```
2. Evento: `messages.upsert`

### 7. MCP Client — URL

No nó **MCP Client** do workflow principal, ajuste o `sseEndpoint`:

```
https://SEU-N8N/mcp/googleCalendar
```

Use a URL do **seu** n8n (não a do exemplo antigo).

### 8. Ativar e testar

1. Ative **MCP-GoogleCalendar** primeiro
2. Ative **BOMCORTE - Agendamento WhatsApp**
3. Envie mensagem no WhatsApp: *"Oi, quero agendar um corte"*
4. O agente deve:
   - Buscar/cadastrar cliente
   - Mostrar serviços e preços
   - Consultar agenda
   - Confirmar e criar evento no Calendar
   - Responder no WhatsApp

## O que a IA faz sozinha

| Intenção | Ações automáticas |
|----------|-------------------|
| Agendar | Busca cliente → mostra preços → consulta agenda → confirma → cria evento → responde |
| Remarcar | Localiza agendamento → verifica novo horário → atualiza/cancela+cria → confirma |
| Cancelar | Localiza evento → confirma → exclui do Calendar |
| Preços | Responde com tabela de combos e avulsos |
| Horários | Lista agenda e sugere slots livres (08:30–17:30, seg–sáb) |

## Formato dos eventos no Calendar

Compatível com o painel web BOMCORTE:

- **Summary:** `João Silva | 09:00 | Combo Essencial | Maycon`
- **Description:**
  ```
  Telefone: 5598992331897
  E-mail: joao@email.com
  Serviço: Combo Essencial
  Valor: R$ 70,00
  Status: confirmado
  ```

## Personalizar prompt e preços

1. Edite `n8n/prompts/bomcorte-agent-system.txt`
2. Edite `n8n/config/bomcorte.json` (preços, horários, barbeiros)
3. Execute `node scripts/build-n8n-workflows.js`
4. Reimporte ou atualize o workflow no n8n

## Adicionar novo barbeiro

1. Crie calendário Google para o barbeiro
2. Adicione em `config/bomcorte.json`:
   ```json
   { "nome": "Carlos", "calendarId": "id-do-calendario", "calendarEmail": "carlos@gmail.com" }
   ```
3. Duplique os 5 nós do MCP com prefixo `Carlos_` (Agendar_Carlos, etc.)
4. Atualize o prompt para mencionar o novo barbeiro
5. Rode o build script

## Troubleshooting

| Problema | Solução |
|----------|---------|
| IA não responde no WhatsApp | Verifique se nó **Enviar texto** está ativo e credencial Evolution OK |
| Erro no Calendar | Reautorize Google Calendar OAuth; confira calendário selecionado |
| MCP não conecta | MCP-GoogleCalendar deve estar ativo; URL do sseEndpoint correta |
| Cliente não encontrado | Confira ID da planilha e aba `clientes` |
| Horário duplicado | IA deve usar Listar_agenda_Maycon antes de agendar |
| Áudio não funciona | OpenAI Whisper ativo no nó **Transcribe a recording** |

## Estrutura de arquivos

```
n8n/
├── config/bomcorte.json          # Configuração central
├── prompts/bomcorte-agent-system.txt  # Prompt do agente
├── templates/planilha-clientes.csv    # Modelo planilha
├── workflows/
│   ├── AgendamentoAutomatico.json
│   └── MCP-GoogleCalendar.json
└── README.md                     # Este arquivo
```
