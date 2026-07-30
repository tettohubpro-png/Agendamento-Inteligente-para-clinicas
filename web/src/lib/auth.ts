const TOKEN_KEY = 'fluxion_google_token'
const PROFILE_KEY = 'fluxion_google_profile'

export type GoogleProfile = {
  name?: string
  email?: string
  picture?: string
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
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

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
].join(' ')
