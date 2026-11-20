import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { errMsg } from '../../services/api'
import useTheme from '../../hooks/useTheme'

export default function Login() {
  useTheme()
  const { admin, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [caps, setCaps] = useState(false)
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-gray via-white to-brand-gray px-4 py-10 dark:from-brand-darker dark:via-brand-black dark:to-brand-darker">
      <div aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-sky/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <form onSubmit={submit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-brand-black/80">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-sky text-white shadow-lg shadow-brand-blue/30">
              <ShieldCheck size={28} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to manage your portfolio</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail size={18} aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="email" type="email" required autoComplete="username" className="input pl-10"
                placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <Lock size={18} aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="password" type={show ? 'text' : 'password'} required
                autoComplete="current-password" className="input pl-10 pr-11"
                placeholder="Enter your password" value={form.password}
                onKeyUp={(e) => setCaps(e.getModifierState('CapsLock'))}
                onBlur={() => setCaps(false)}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky dark:hover:text-brand-sky">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {caps && <p className="mt-1 text-xs text-amber-500">Caps Lock is on</p>}
          </div>

          <button className="btn w-full py-2.5" disabled={busy}>
            {busy && (
              <span aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/"
          className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 transition hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-sky">
          <ArrowLeft size={16} aria-hidden="true" /> Back to website
        </Link>
      </div>
    </div>
  )
}
