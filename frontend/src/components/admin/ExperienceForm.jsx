import { useState } from 'react'
import api, { errMsg } from '../../services/api'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import FormActions from '../ui/FormActions'

const TYPES = ['Full-time', 'Part-time', 'Internship', 'OJT', 'Freelance', 'Contract']

export default function ExperienceForm({ item, onSaved, onCancel }) {
  const [f, setF] = useState({
    company: item?.company || '',
    position: item?.position || '',
    employment_type: item?.employment_type || 'Internship',
    start_date: item?.start_date?.slice(0, 10) || '',
    end_date: item?.end_date?.slice(0, 10) || '',
    is_current: item?.is_current ?? false,
    responsibilities: (item?.responsibilities || []).join('\n'),
    technologies: (item?.technologies || []).join(', '),
    sort_order: item?.sort_order ?? 0,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.company.trim() || !f.position.trim()) return setError('Company and position are required')
    if (!f.start_date) return setError('Start date is required')
    if (!f.is_current && f.end_date && f.end_date < f.start_date) {
      return setError('End date must be after the start date')
    }
    const payload = {
      company: f.company,
      position: f.position,
      employment_type: f.employment_type,
      start_date: f.start_date,
      end_date: f.is_current ? null : f.end_date || null,
      is_current: f.is_current,
      responsibilities: f.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      technologies: f.technologies.split(',').map((s) => s.trim()).filter(Boolean),
      sort_order: Number(f.sort_order) || 0,
    }
    setBusy(true)
    try {
      if (item) await api.put(`/admin/experiences/${item.id}`, payload)
      else await api.post('/admin/experiences', payload)
      onSaved()
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  return (
    <Modal title={item ? 'Edit experience' : 'Add experience'} onClose={onCancel} wide backdrop={false}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company *" id="x-company">
            <input id="x-company" className="input" value={f.company} onChange={set('company')} />
          </Field>
          <Field label="Position *" id="x-position">
            <input id="x-position" className="input" value={f.position} onChange={set('position')} />
          </Field>
        </div>
        <Field label="Employment type" id="x-type">
          <select id="x-type" className="input" value={f.employment_type} onChange={set('employment_type')}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date *" id="x-start">
            <input id="x-start" type="date" className="input" value={f.start_date} onChange={set('start_date')} />
          </Field>
          <Field label="End date" id="x-end">
            <input id="x-end" type="date" className="input" disabled={f.is_current}
              value={f.is_current ? '' : f.end_date} onChange={set('end_date')} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_current} onChange={set('is_current')} /> I currently work here
        </label>
        <Field label="Responsibilities (one per line)" id="x-resp">
          <textarea id="x-resp" rows={4} className="input" value={f.responsibilities} onChange={set('responsibilities')} />
        </Field>
        <Field label="Technologies (comma separated)" id="x-tech">
          <input id="x-tech" className="input" value={f.technologies} onChange={set('technologies')} />
        </Field>
        <Field label="Display order (lower shows first)" id="x-order">
          <input id="x-order" type="number" className="input" value={f.sort_order} onChange={set('sort_order')} />
        </Field>
        <FormActions onCancel={onCancel} busy={busy} />
      </form>
    </Modal>
  )
}
