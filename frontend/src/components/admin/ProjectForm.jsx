import { useState } from 'react'
import { X } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import Modal from '../ui/Modal'

const OK = ['image/jpeg', 'image/png', 'image/webp']
const validFile = (f) => OK.includes(f.type) && f.size <= 10 * 1024 * 1024

export default function ProjectForm({ project, onSaved, onCancel, onImageDeleted }) {
  const [f, setF] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || '',
    technologies: (project?.technologies || []).join(', '),
    github_url: project?.github_url || '',
    live_url: project?.live_url || '',
    status: project?.status || 'completed',
    is_featured: project?.is_featured ?? false,
    is_published: project?.is_published ?? true,
  })
  const [thumb, setThumb] = useState(null)
  const [images, setImages] = useState([])
  const [existing, setExisting] = useState(project?.images || [])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const removeImage = async (img) => {
    try {
      await api.delete(`/admin/projects/${project.id}/images/${img.id}`)
      setExisting((x) => x.filter((i) => i.id !== img.id))
      onImageDeleted()
    } catch (err) { setError(errMsg(err)) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.title.trim()) return setError('Title is required')
    for (const k of ['github_url', 'live_url']) {
      if (f[k].trim() && !/^https?:\/\/\S+$/i.test(f[k].trim())) {
        return setError('URLs must start with http:// or https://')
      }
    }
    if (images.length > 10) return setError('Maximum 10 gallery images at a time')
    if (![thumb, ...images].filter(Boolean).every(validFile)) {
      return setError('Images must be JPG, PNG or WebP, max 10 MB each')
    }

    const fd = new FormData()
    fd.append('title', f.title)
    fd.append('description', f.description)
    fd.append('category', f.category)
    fd.append('technologies', JSON.stringify(f.technologies.split(',').map((s) => s.trim()).filter(Boolean)))
    fd.append('github_url', f.github_url)
    fd.append('live_url', f.live_url)
    fd.append('status', f.status)
    fd.append('is_featured', String(f.is_featured))
    fd.append('is_published', String(f.is_published))
    if (thumb) fd.append('thumbnail', thumb)
    images.forEach((i) => fd.append('images', i))

    setBusy(true)
    try {
      if (project) await api.put(`/admin/projects/${project.id}`, fd)
      else await api.post('/admin/projects', fd)
      onSaved()
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onCancel} wide backdrop={false}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

        <div>
          <label htmlFor="p-title" className="mb-1 block text-sm">Title *</label>
          <input id="p-title" className="input" value={f.title} onChange={set('title')} maxLength={200} />
        </div>
        <div>
          <label htmlFor="p-desc" className="mb-1 block text-sm">Description</label>
          <textarea id="p-desc" rows={4} className="input" value={f.description} onChange={set('description')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-cat" className="mb-1 block text-sm">Category</label>
            <input id="p-cat" className="input" value={f.category} onChange={set('category')} placeholder="Web App" />
          </div>
          <div>
            <label htmlFor="p-status" className="mb-1 block text-sm">Status</label>
            <select id="p-status" className="input" value={f.status} onChange={set('status')}>
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="p-tech" className="mb-1 block text-sm">Technologies (comma separated)</label>
          <input id="p-tech" className="input" value={f.technologies} onChange={set('technologies')} placeholder="React, Node.js, PostgreSQL" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-gh" className="mb-1 block text-sm">GitHub URL</label>
            <input id="p-gh" className="input" value={f.github_url} onChange={set('github_url')} placeholder="https://github.com/..." />
          </div>
          <div>
            <label htmlFor="p-live" className="mb-1 block text-sm">Live demo URL</label>
            <input id="p-live" className="input" value={f.live_url} onChange={set('live_url')} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label htmlFor="p-thumb" className="mb-1 block text-sm">Thumbnail</label>
          {project?.thumbnail && !thumb && (
            <img src={project.thumbnail} alt="Current thumbnail" className="mb-2 h-20 rounded-lg object-cover" />
          )}
          <input id="p-thumb" type="file" accept="image/jpeg,image/png,image/webp" className="input"
            onChange={(e) => setThumb(e.target.files[0] || null)} />
        </div>

        <div>
          <label htmlFor="p-imgs" className="mb-1 block text-sm">Gallery images (up to 10 at a time)</label>
          {existing.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {existing.map((img) => (
                <div key={img.id} className="relative">
                  <img src={img.image_url} alt="Project" className="h-16 w-24 rounded-lg object-cover" />
                  <button type="button" aria-label="Remove image" onClick={() => removeImage(img)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input id="p-imgs" type="file" multiple accept="image/jpeg,image/png,image/webp" className="input"
            onChange={(e) => setImages(Array.from(e.target.files))} />
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.is_featured} onChange={set('is_featured')} /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.is_published} onChange={set('is_published')} /> Published
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save project'}</button>
        </div>
      </form>
    </Modal>
  )
}
