import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user ?? null)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.authUrl) {
        window.location.assign(data.authUrl)
      }
    } catch {
      setUser(null)
    }
  }

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      window.location.assign('/')
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signOut,
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
