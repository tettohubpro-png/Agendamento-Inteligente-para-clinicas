import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { getProfile } from '../lib/auth'
import { resolveUserRole } from '../lib/erpStore'
import { hasPermission, type Permission } from '../lib/permissions'
import type { Usuario } from '../types/erp'
import { useErp } from './ErpContext'

type AuthContextValue = {
  usuario: Usuario | null
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { state, ensureLoggedUser } = useErp()
  const profile = getProfile()

  useEffect(() => {
    if (!profile?.email) return
    ensureLoggedUser({
      email: profile.email,
      nome: profile.name,
      fotoUrl: profile.picture,
    })
  }, [profile?.email, profile?.name, profile?.picture, ensureLoggedUser])

  const usuario = useMemo(() => {
    if (!profile?.email) return null
    return (
      resolveUserRole(profile.email, state.usuarios) ?? {
        id: 'temp',
        email: profile.email,
        nome: profile.name || profile.email.split('@')[0],
        fotoUrl: profile.picture,
        role: 'recepcionista' as const,
        ativo: true,
      }
    )
  }, [profile, state.usuarios])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      can: (permission) => (usuario ? hasPermission(usuario.role, permission) : false),
    }),
    [usuario],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora de AuthProvider')
  return ctx
}
