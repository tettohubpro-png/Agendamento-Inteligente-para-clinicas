const TOKEN_KEY = 'fluxion_google_token'
const PROFILE_KEY = 'fluxion_google_profile'
const EXPIRES_KEY = 'fluxion_google_token_expires'

export type GoogleProfile = {
  name?: string
  email?: string
  picture?: string
}

export function getAccessToken(): string | null {
  if (isTokenExpired()) {
    clearAuth()
    return null
  }
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string, expiresInSeconds?: number) {
  sessionStorage.setItem(TOKEN_KEY, token)
  const seconds = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : 3600
  // renovar 60s antes de expirar
  const expiresAt = Date.now() + (seconds - 60) * 1000
  sessionStorage.setItem(EXPIRES_KEY, String(expiresAt))
}

export function isTokenExpired() {
  const raw = sessionStorage.getItem(EXPIRES_KEY)
  if (!raw) return false
  const expiresAt = Number(raw)
  if (!Number.isFinite(expiresAt)) return false
  return Date.now() >= expiresAt
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
  sessionStorage.removeItem(EXPIRES_KEY)
}

export function setProfile(profile: GoogleProfile) {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getProfile(): GoogleProfile | null {
  const raw = sessionStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GoogleProfile
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

export function forceRelogin(message?: string) {
  clearAuth()
  const q = message ? `?motivo=${encodeURIComponent(message)}` : ''
  window.location.assign(`/login${q}`)
}

export function isAuthErrorMessage(message: string) {
  const m = message.toLowerCase()
  return (
    m.includes('invalid authentication') ||
    m.includes('unauthenticated') ||
    m.includes('token google ausente') ||
    m.includes('login cookie') ||
    m.includes('401')
  )
}

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
].join(' ')
