/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_CALENDAR_ELIZEU_ID: string
  readonly VITE_CALENDAR_PAULO_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
