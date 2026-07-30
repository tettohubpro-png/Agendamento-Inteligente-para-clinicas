# BOMCORTE — Barbearia

Ecossistema de agendamento inteligente para a barbearia **BOMCORTE** (São Luís — MA).

## Canais

| Quem | Onde |
|------|------|
| **Cliente** | WhatsApp (98) 99233-1897 — agente n8n |
| **Barbeiro / equipe** | Painel web (Google login) |

## Estrutura

```
├── n8n/workflows/          # Agente WhatsApp
├── web/                    # Painel BOMCORTE + Netlify Functions
└── README.md
```

## Painel web

- **Produção:** https://fluxionai-clinic-hub.netlify.app (renomear para bomcorte na Netlify)
- Login com **Google** (cada barbeiro usa seu Gmail)
- Barbeiro atual: **Maycon**

### Rodar local

```bash
cd web
npm install
npx netlify dev
```

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
