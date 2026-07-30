import { createContext, useContext, useMemo, type ReactNode } from 'react'
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
  const { state } = useErp()
  const profile = getProfile()

  const usuario = useMemo(() => {
    if (!profile?.email) return null
    return resolveUserRole(profile.email, state.usuarios)
  }, [profile?.email, state.usuarios])

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
