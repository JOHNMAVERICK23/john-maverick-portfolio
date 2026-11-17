import { useEffect, useState } from 'react'
import api, { errMsg } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Field from '../../components/ui/Field'

export default function About() {
  const toast = useToast()
  const [f, setF] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/admin/profile')
      .then(({ data }) => setF({
        biography: data.biography || '',
        career_goals: data.career_goals || '',
      }))
      .catch((e) => setError(errMsg(e)))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.put('/admin/profile', f)
      toast('About saved')
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  if (!f) return error ? <p className="text-red-500">{error}</p> : <p>Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">About</h1>
      <form onSubmit={submit} className="card space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <Field label="Biography" id="ab-bio">
          <textarea id="ab-bio" rows={8} className="input" value={f.biography}
            onChange={(e) => setF({ ...f, biography: e.target.value })} />
        </Field>
        <Field label="Career goals" id="ab-goals">
          <textarea id="ab-goals" rows={5} className="input" value={f.career_goals}
            onChange={(e) => setF({ ...f, career_goals: e.target.value })} />
        </Field>
        <p className="text-xs text-slate-500">
          Your photo, email, phone and location come from Profile. Educational background comes from Education.
        </p>
        <div className="flex justify-end">
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save about'}</button>
        </div>
      </form>
    </div>
  )
}
