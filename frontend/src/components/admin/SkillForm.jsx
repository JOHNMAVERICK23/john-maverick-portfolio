import { useState } from 'react'
import api, { errMsg } from '../../services/api'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import FormActions from '../ui/FormActions'

const OK = ['image/jpeg', 'image/png', 'image/webp']

export default function SkillForm({ item, categories, onSaved, onCancel }) {
  const [f, setF] = useState({
    name: item?.name || '',
    category_id: item?.category_id ? String(item.category_id) : '',
    proficiency: item?.proficiency ?? 50,
    is_featured: item?.is_featured ?? false,
  })
  const [icon, setIcon] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.name.trim()) return setError('Skill name is required')
    if (icon && (!OK.includes(icon.type) || icon.size > 10 * 1024 * 1024)) {
      return setError('Icon must be JPG, PNG or WebP, max 10 MB')
    }
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.append(k, String(v)))
    if (icon) fd.append('icon', icon)
    setBusy(true)
    try {
      if (item) await api.put(`/admin/skills/${item.id}`, fd)
      else await api.post('/admin/skills', fd)
      onSaved()
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  return (
    <Modal title={item ? 'Edit skill' : 'Add skill'} onClose={onCancel} backdrop={false}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <Field label="Name *" id="s-name">
          <input id="s-name" className="input" value={f.name} onChange={set('name')} maxLength={100} />
        </Field>
        <Field label="Category" id="s-cat">
          <select id="s-cat" className="input" value={f.category_id} onChange={set('category_id')}>
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label={`Proficiency: ${f.proficiency}%`} id="s-prof">
          <input id="s-prof" type="range" min="0" max="100" step="5" className="w-full"
            value={f.proficiency} onChange={set('proficiency')} />
        </Field>
        <Field label="Icon" id="s-icon">
          {item?.icon && !icon && <img src={item.icon} alt="Current icon" className="mb-2 h-10 w-10 object-contain" />}
          <input id="s-icon" type="file" accept="image/jpeg,image/png,image/webp" className="input"
            onChange={(e) => setIcon(e.target.files[0] || null)} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_featured} onChange={set('is_featured')} /> Featured on home page
        </label>
        <FormActions onCancel={onCancel} busy={busy} />
      </form>
    </Modal>
  )
}
