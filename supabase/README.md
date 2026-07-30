# Supabase — BOMCORTE

## 1. Criar projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → nome: `bomcorte` → região: **South America (São Paulo)**
3. Aguarde o projeto inicializar (~2 min)

## 2. Aplicar schema

No **SQL Editor**, cole e execute o conteúdo de:

```
supabase/migrations/001_bomcorte_erp.sql
```

## 3. Copiar credenciais

Em **Project Settings → API**:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 4. Configurar Netlify

```bash
cd web
npx netlify-cli env:set VITE_SUPABASE_URL "https://SEU-PROJETO.supabase.co"
npx netlify-cli env:set VITE_SUPABASE_ANON_KEY "sua-anon-key"
npx netlify-cli deploy --prod --dir dist --functions netlify/functions --no-build
```

## 5. Configurar local

Crie `web/.env.local`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

## Organização detectada

- **Tettohub pro** (`xuseadhgyktfqtsxmtld`)

O projeto pode ser criado no plano gratuito (R$ 0/mês).

## Estado atual

- O painel funciona com **localStorage** sem Supabase
- Com as variáveis configuradas, o cliente Supabase fica ativo para a próxima fase de sincronização completa
