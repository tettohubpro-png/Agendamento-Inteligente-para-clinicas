# Agendamento Inteligente para Clínicas

Sistema de atendimento e agendamento por WhatsApp com agente de IA (**FluxionAI**), painel web e **Google Calendar** como fonte da verdade.

## Estrutura

```
├── n8n/workflows/          # Agente WhatsApp (n8n)
├── web/                    # Painel React + Netlify Functions
│   ├── netlify/functions/  # Proxy autenticado da Calendar API
│   ├── src/                # Front (Dashboard, Agenda, etc.)
│   └── netlify.toml
└── README.md
```

## Painel web + Google Calendar

### 1. Google Cloud

1. Crie um projeto em [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a **Google Calendar API**
3. Em **APIs e serviços → Tela de consentimento OAuth**, configure o app
4. Em **Credenciais**, crie um **ID do cliente OAuth** (Aplicativo da Web)
5. Origins autorizados:
   - `http://localhost:5173`
   - `http://localhost:8888`
   - `https://SEU-SITE.netlify.app`
6. Escopos necessários: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/calendar`

### 2. Variáveis de ambiente

```bash
cd web
cp .env.example .env.local
```

Preencha:

| Variável | Uso |
|----------|-----|
| `VITE_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_ID` | OAuth Web Client |
| `VITE_CALENDAR_ELIZEU_ID` / `CALENDAR_ELIZEU_ID` | Agenda do Dr. Elizeu (e-mail ou ID, ou `primary`) |
| `VITE_CALENDAR_PAULO_ID` / `CALENDAR_PAULO_ID` | Agenda do Dr. Paulo |

### 3. Rodar local (com Functions)

```bash
cd web
npm install
npx netlify dev
```

Abre em `http://localhost:8888`. Login com **Entrar com Google**.

Só o Vite (`npm run dev`) sobe o front; as rotas `/api/*` precisam do `netlify dev` (ou do proxy apontando para a porta 8888).

### 4. Deploy Netlify

1. Conecte o repositório no Netlify
2. **Base directory:** `web`
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`
5. Em **Environment variables**, configure as mesmas chaves do `.env.example`
6. Redeploy

O `netlify.toml` já define redirects SPA e `/api/*` → Functions.

## Formato dos eventos

- **Summary:** `Nome | HH:mm | Médico`
- **Description:** `Telefone` / `E-mail` / `Status`
- **Duração:** 30 minutos (`America/Sao_Paulo`)
- **Cancelar:** remove o evento da agenda

## Workflows n8n (WhatsApp)

Importe `n8n/workflows/`:

1. `AgendamentoAutomatico.json`
2. `MCP-GoogleCalendar.json`

Podem usar as **mesmas agendas** Google do painel.

## Regras de negócio

- Seg–sex, 08:00–18:00, slots de 30 min
- Dr. Elizeu (urologista) e Dr. Paulo (oncologista)
- Sem conflito de horário; um agendamento ativo por paciente
