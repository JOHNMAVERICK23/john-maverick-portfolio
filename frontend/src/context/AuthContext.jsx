/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then((r) => setAdmin(r.data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAdmin(data.admin)
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    setAdmin(null)
  }

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>
}
