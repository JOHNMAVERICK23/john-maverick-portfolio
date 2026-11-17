/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'

const Ctx = createContext(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id}
            className={`rounded-lg px-4 py-3 text-sm text-white shadow-lg ${t.type === 'error' ? 'bg-red-600' : 'bg-brand-blue'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
