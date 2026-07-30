import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Permission } from '../lib/permissions'

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can } = useAuth()
  return can(permission) ? children : fallback
}
