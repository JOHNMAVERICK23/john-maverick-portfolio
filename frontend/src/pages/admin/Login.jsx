import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { errMsg } from '../../services/api'
import useTheme from '../../hooks/useTheme'

export default function Login() {
  useTheme()
  const { admin, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && admin) return <Navigate to="/admin/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm">Email</label>
          <input id="email" type="email" required autoComplete="username" className="input"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className="input"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
