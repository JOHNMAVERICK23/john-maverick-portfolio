import { useState } from 'react'
import api, { errMsg } from '../../services/api'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import FormActions from '../ui/FormActions'

const validYear = (y) => y === '' || (/^\d{4}$/.test(y) && +y >= 1950 && +y <= 2100)

export default function EducationForm({ item, onSaved, onCancel }) {
  const [f, setF] = useState({
    school_name: item?.school_name || '',
    degree: item?.degree || '',
    year_started: item?.year_started ?? '',
    year_completed: item?.year_completed ?? '',
    description: item?.description || '',
    sort_order: item?.sort_order ?? 0,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const s = String(f.year_started)
    const c = String(f.year_completed)
    if (!f.school_name.trim() || !f.degree.trim()) return setError('School and degree/course are required')
    if (!validYear(s) || !validYear(c)) return setError('Years must be 4 digits (1950 to 2100)')
    if (s && c && +c < +s) return setError('Year completed cannot be before year started')
    setBusy(true)
    try {
      const payload = { ...f, sort_order: Number(f.sort_order) || 0 }
      if (item) await api.put(`/admin/education/${item.id}`, payload)
      else await api.post('/admin/education', payload)
      onSaved()
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  return (
    <Modal title={item ? 'Edit education' : 'Add education'} onClose={onCancel} wide backdrop={false}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <Field label="School name *" id="e-school">
          <input id="e-school" className="input" value={f.school_name} onChange={set('school_name')} />
        </Field>
        <Field label="Degree or course *" id="e-degree">
          <input id="e-degree" className="input" value={f.degree} onChange={set('degree')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Year started" id="e-start">
            <input id="e-start" inputMode="numeric" maxLength={4} className="input" value={f.year_started} onChange={set('year_started')} />
          </Field>
          <Field label="Year completed (blank if ongoing)" id="e-end">
            <input id="e-end" inputMode="numeric" maxLength={4} className="input" value={f.year_completed} onChange={set('year_completed')} />
          </Field>
        </div>
        <Field label="Description" id="e-desc">
          <textarea id="e-desc" rows={3} className="input" value={f.description} onChange={set('description')} />
        </Field>
        <Field label="Display order (lower shows first)" id="e-order">
          <input id="e-order" type="number" className="input" value={f.sort_order} onChange={set('sort_order')} />
        </Field>
        <FormActions onCancel={onCancel} busy={busy} />
      </form>
    </Modal>
  )
}
