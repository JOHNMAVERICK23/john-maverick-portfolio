import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Star } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import useList from '../../hooks/useList'
import useDebounce from '../../hooks/useDebounce'
import { useToast } from '../../context/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'
import ProjectForm from '../../components/admin/ProjectForm'

const LIMIT = 10
const STATUS = { planned: 'Planned', in_progress: 'In progress', completed: 'Completed' }

export default function Projects() {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null | {} (new) | project
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const search = useDebounce(q)

  const { data, total, loading, error, reload } = useList('/admin/projects', {
    q: search || undefined, page, limit: LIMIT,
  })

  const togglePublish = async (p) => {
    try {
      await api.put(`/admin/projects/${p.id}`, { is_published: !p.is_published })
      toast(p.is_published ? 'Project unpublished' : 'Project published')
      reload()
    } catch (e) { toast(errMsg(e), 'error') }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/admin/projects/${toDelete.id}`)
      toast('Project deleted')
      setToDelete(null)
      if (data.length === 1 && page > 1) setPage(page - 1)
      else reload()
    } catch (e) { toast(errMsg(e), 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button className="btn" onClick={() => setEditing({})}><Plus size={16} /> New project</button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input className="input pl-9" placeholder="Search title or category" aria-label="Search projects"
          value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && data.length === 0 && (
        <div className="card text-center text-sm text-slate-500">No projects yet. Click “New project”.</div>
      )}

      {data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/10">
              <tr>
                <th className="p-3">Project</th><th className="p-3">Category</th>
                <th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {data.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt="" className="h-10 w-14 rounded object-cover" />
                        : <div className="h-10 w-14 rounded bg-slate-200 dark:bg-white/10" />}
                      <div>
                        <p className="font-medium">
                          {p.title}
                          {p.is_featured && <Star size={14} className="ml-1 inline text-brand-sky" aria-label="Featured" />}
                        </p>
                        {!p.is_published && <span className="text-xs text-amber-500">Unpublished</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.category || '—'}</td>
                  <td className="whitespace-nowrap p-3">{STATUS[p.status]}</td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <button aria-label={p.is_published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(p)}
                      className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10">
                      {p.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button aria-label="Edit" onClick={() => setEditing(p)}
                      className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Pencil size={16} /></button>
                    <button aria-label="Delete" onClick={() => setToDelete(p)}
                      className="rounded p-2 text-red-500 hover:bg-red-500/10"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} limit={LIMIT} total={total} onChange={setPage} />

      {editing && (
        <ProjectForm
          project={editing.id ? editing : null}
          onCancel={() => setEditing(null)}
          onImageDeleted={reload}
          onSaved={() => { setEditing(null); toast('Project saved'); reload() }}
        />
      )}

      {toDelete && (
        <ConfirmDialog title="Delete project?" busy={busy}
          message={`“${toDelete.title}” and its images will be permanently deleted.`}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
