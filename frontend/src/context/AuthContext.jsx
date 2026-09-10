import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('bcc_token') || '')
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bcc_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const canOperateCenters = user?.role === 'ADMIN' || user?.role === 'OPERATOR' || user?.role === 'SUPER_ADMIN'

  function persistAuth(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('bcc_token', nextToken)
    localStorage.setItem('bcc_user', JSON.stringify(nextUser))
  }

  function logout() {
    if (token) api.logout(token).catch(() => {})
    setToken('')
    setUser(null)
    localStorage.removeItem('bcc_token')
    localStorage.removeItem('bcc_user')
  }

  async function login(username, password) {
    setLoading(true)
    setError('')
    try {
      const res = await api.login({ username, password })
      persistAuth(res.token, res.user)
      return res.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, error, setError, login, logout, isAdmin, isSuperAdmin, canOperateCenters }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
