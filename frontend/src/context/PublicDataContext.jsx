/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const Ctx = createContext(null)
export const usePublic = () => useContext(Ctx)

const ENDPOINTS = {
  profile: '/profile',
  settings: '/settings',
  projects: '/projects',
  skills: '/skills',
  experiences: '/experiences',
  certificates: '/certificates',
  education: '/education',
}

export function PublicProvider({ children }) {
  const [state, setState] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    let cancelled = false
    const keys = Object.keys(ENDPOINTS)
    Promise.all(keys.map((k) => api.get(ENDPOINTS[k])))
      .then((res) => {
        if (cancelled) return
        const data = Object.fromEntries(keys.map((k, i) => [k, res[i].data]))
        setState({ loading: false, error: '', data })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ loading: false, error: 'Could not load the portfolio. Please try again later.', data: null })
        }
      })
    return () => { cancelled = true }
  }, [])

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>
}
