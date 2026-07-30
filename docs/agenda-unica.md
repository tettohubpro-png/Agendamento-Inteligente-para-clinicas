# Agenda principal BOMCORTE

## Conta base

**Gmail da agenda:** `bomcorteslz@gmail.com`

- Esse e-mail é a **fonte da verdade** dos agendamentos
- Os outros Gmails servem **só para login** no painel
- Na Netlify: `GOOGLE_CALENDAR_ID=bomcorteslz@gmail.com`

> O ID da agenda principal de uma conta Google é o próprio e-mail.  
> Nunca use a palavra `primary` (isso abre a agenda de quem está logado).

## Compartilhar com a equipe (obrigatório)

Entre em [Google Calendar](https://calendar.google.com) com **bomcorteslz@gmail.com**:

1. Engrenagem → **Configurações**
2. Clique na agenda principal (à esquerda)
3. **Compartilhar com pessoas específicas**
4. Adicione cada Gmail da equipe (Maycon, recepção, etc.)
5. Permissão: **Fazer alterações nos eventos**
6. Salve

Sem esse compartilhamento, quem logar com outro Gmail não consegue ler/gravar a agenda.

## Google Cloud (login)

Em **Público-alvo → Usuários de teste**, inclua:

- `bomcorteslz@gmail.com`
- todos os Gmails da equipe

## Fluxo

1. Cliente confirma horário
2. Sistema grava em `bomcorteslz@gmail.com`
3. Se o horário já existir → **"já está reservado"**
4. Qualquer login autorizado vê a mesma agenda
