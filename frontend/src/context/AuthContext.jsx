// Authentication context + provider (Task 3.6).
//
// - Access token lives in MEMORY ONLY (not localStorage). On reload, the
//   persisted refresh-token cookie is used to silently obtain a new access
//   token, then /auth/me loads the user.
// - Every route update reads `user` / `loading` from context so protected
//   routes don't flash-transition during reload.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import apiClient, { clearAccessToken, setAccessToken } from "../services/apiClient";
import { authService } from "../features/auth/services/authService";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentUser = useCallback(async (accessToken) => {
    if (accessToken) setAccessToken(accessToken)
    try {
      const me = await authService.me()
      setUser(me)
    } catch {
      setUser(null)
      clearAccessToken()
    }
  }, [])

  // Restore the session when the app mounts (via refresh cookie).
  useEffect(() => {
    let cancelled = false
    async function restore() {
      setLoading(true)
      try {
        const token = await authService.refresh()
        if (cancelled) return
        await loadCurrentUser(token)
      } catch {
        if (cancelled) return
        setUser(null)
        clearAccessToken()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [loadCurrentUser])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    setAccessToken(data.access_token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (data) => authService.register(data), [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Clear client state even if the backend call fails (e.g. network).
    }
    clearAccessToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
// Re-export for feature code that wants the hook under a conventional path.
export { useAuth as useAuthContext }
