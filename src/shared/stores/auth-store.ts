import { create } from 'zustand'

import { authApi } from '@/features/auth/api'
import type { AuthUser, LoginCredentials } from '@/features/auth/types'
import { AUTH_STORAGE_KEY } from '@/shared/lib/constants'

/**
 * Shape written to `localStorage` under `AUTH_STORAGE_KEY`.
 * Kept in sync with `src/shared/api/client.ts`, which reads the same key.
 */
interface PersistedAuthState {
  state: {
    token: string | null
    user: AuthUser | null
  }
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  /** Calls the login API, stores the session, and persists it to localStorage. */
  login: (credentials: LoginCredentials) => Promise<void>
  /** Clears the in-memory and persisted session. */
  logout: () => void
  /** Restores a previously persisted session from localStorage. Call once on app start. */
  hydrate: () => void
}

function persistAuth(token: string | null, user: AuthUser | null): void {
  if (token && user) {
    const payload: PersistedAuthState = { state: { token, user } }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  async login(credentials) {
    const { accessToken, user } = await authApi.login(credentials)
    persistAuth(accessToken, user)
    set({ token: accessToken, user, isAuthenticated: true })
  },

  logout() {
    persistAuth(null, null)
    set({ token: null, user: null, isAuthenticated: false })
  },

  hydrate() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as PersistedAuthState
      const { token, user } = parsed.state ?? {}
      if (token && user) {
        set({ token, user, isAuthenticated: true })
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  },
}))
