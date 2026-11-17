import { useState } from 'react'
import api, { errMsg } from '../../services/api'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import FormActions from '../ui/FormActions'

const OK = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export default function CertificateForm({ item, onSaved, onCancel }) {
  const [f, setF] = useState({
    title: item?.title || '',
    issuer: item?.issuer || '',
    issue_date: item?.issue_date?.slice(0, 10) || '',
    description: item?.description || '',
    credential_url: item?.credential_url || '',
    is_published: item?.is_published ?? true,
    sort_order: item?.sort_order ?? 0,
  })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.title.trim() || !f.issuer.trim()) return setError('Title and issuing organization are required')
    if (f.credential_url.trim() && !/^https?:\/\/\S+$/i.test(f.credential_url.trim())) {
      return setError('Credential URL must start with http:// or https://')
    }
    if (file && (!OK.includes(file.type) || file.size > 10 * 1024 * 1024)) {
      return setError('File must be JPG, PNG, WebP or PDF, max 10 MB')
    }
    const fd = new FormData()
    Object.entries({ ...f, sort_order: Number(f.sort_order) || 0 })
      .forEach(([k, v]) => fd.append(k, String(v)))
    if (file) fd.append('file', file)
    setBusy(true)
    try {
      if (item) await api.put(`/admin/certificates/${item.id}`, fd)
      else await api.post('/admin/certificates', fd)
      onSaved()
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  return (
    <Modal title={item ? 'Edit certificate' : 'Add certificate'} onClose={onCancel} wide backdrop={false}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <Field label="Title *" id="c-title">
          <input id="c-title" className="input" value={f.title} onChange={set('title')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Issuing organization *" id="c-issuer">
            <input id="c-issuer" className="input" value={f.issuer} onChange={set('issuer')} />
          </Field>
          <Field label="Issue date" id="c-date">
            <input id="c-date" type="date" className="input" value={f.issue_date} onChange={set('issue_date')} />
          </Field>
        </div>
        <Field label="Description" id="c-desc">
          <textarea id="c-desc" rows={3} className="input" value={f.description} onChange={set('description')} />
        </Field>
        <Field label="Credential URL" id="c-url">
          <input id="c-url" className="input" placeholder="https://..." value={f.credential_url} onChange={set('credential_url')} />
        </Field>
        <Field label="Certificate image or PDF" id="c-file">
          {item?.file_url && !file && (
            <a href={item.file_url} target="_blank" rel="noreferrer"
              className="mb-2 block text-sm text-brand-blue hover:underline">View current file</a>
          )}
          <input id="c-file" type="file" className="input"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setFile(e.target.files[0] || null)} />
        </Field>
        <Field label="Display order (lower shows first)" id="c-order">
          <input id="c-order" type="number" className="input" value={f.sort_order} onChange={set('sort_order')} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_published} onChange={set('is_published')} /> Published
        </label>
        <FormActions onCancel={onCancel} busy={busy} />
      </form>
    </Modal>
  )
}
