import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as loginRequest } from '../api/client'

export interface Session {
  token: string
  username: string
  expiresAt: string
}

interface AuthContextValue {
  session: Session | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = 'vtslegalofficeai.session'

function loadStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Session
    if (new Date(parsed.expiresAt) <= new Date()) return null

    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadStoredSession)

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  async function login(username: string, password: string) {
    const result = await loginRequest(username, password)
    setSession({ token: result.token, username: result.username, expiresAt: result.expiresAt })
  }

  function logout() {
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
