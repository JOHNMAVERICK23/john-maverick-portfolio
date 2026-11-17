import { useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star, Tags, Search } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import useList from '../../hooks/useList'
import useDebounce from '../../hooks/useDebounce'
import { useToast } from '../../context/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import SkillForm from '../../components/admin/SkillForm'
import CategoryManager from '../../components/admin/CategoryManager'

export default function Skills() {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [showCats, setShowCats] = useState(false)
  const [busy, setBusy] = useState(false)
  const search = useDebounce(q)
  const skills = useList('/admin/skills', { q: search || undefined, limit: 100 })
  const cats = useList('/admin/skill-categories', { limit: 100 })
  const catName = Object.fromEntries(cats.data.map((c) => [c.id, c.name]))
  const canReorder = !search

  const move = async (i, dir) => {
    const ids = skills.data.map((s) => s.id)
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    const tmp = ids[i]
    ids[i] = ids[j]
    ids[j] = tmp
    try {
      await api.put('/admin/skills/reorder', { ids })
      skills.reload()
    } catch (e) { toast(errMsg(e), 'error') }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/admin/skills/${toDelete.id}`)
      toast('Skill deleted')
      setToDelete(null)
      skills.reload()
    } catch (e) { toast(errMsg(e), 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Skills</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setShowCats(true)}><Tags size={16} /> Categories</button>
          <button className="btn" onClick={() => setEditing({})}><Plus size={16} /> Add skill</button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input className="input pl-9" placeholder="Search skills" aria-label="Search skills"
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!canReorder && <p className="text-xs text-slate-500">Clear the search to reorder skills.</p>}

      {skills.error && <p className="text-red-500">{skills.error}</p>}
      {skills.loading && <p>Loading…</p>}
      {!skills.loading && !skills.error && skills.data.length === 0 && (
        <div className="card text-center text-sm text-slate-500">No skills yet. Add a category first, then a skill.</div>
      )}

      {skills.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/10">
              <tr>
                <th className="p-3">Skill</th><th className="p-3">Category</th>
                <th className="p-3">Level</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {skills.data.map((s, i) => (
                <tr key={s.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {s.icon
                        ? <img src={s.icon} alt="" className="h-8 w-8 rounded object-contain" />
                        : <div className="h-8 w-8 rounded bg-slate-200 dark:bg-white/10" />}
                      <span className="font-medium">
                        {s.name}
                        {s.is_featured && <Star size={14} className="ml-1 inline text-brand-sky" aria-label="Featured" />}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">{catName[s.category_id] || <span className="text-slate-400">Uncategorized</span>}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded bg-slate-200 dark:bg-white/10">
                        <div className="h-2 rounded bg-brand-blue" style={{ width: `${s.proficiency}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{s.proficiency}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {canReorder && (
                      <>
                        <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}
                          className="rounded p-2 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10"><ArrowUp size={16} /></button>
                        <button aria-label="Move down" disabled={i === skills.data.length - 1} onClick={() => move(i, 1)}
                          className="rounded p-2 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10"><ArrowDown size={16} /></button>
                      </>
                    )}
                    <button aria-label="Edit" onClick={() => setEditing(s)}
                      className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Pencil size={16} /></button>
                    <button aria-label="Delete" onClick={() => setToDelete(s)}
                      className="rounded p-2 text-red-500 hover:bg-red-500/10"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <SkillForm item={editing.id ? editing : null} categories={cats.data}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); toast('Skill saved'); skills.reload() }} />
      )}
      {showCats && (
        <CategoryManager categories={cats.data} onClose={() => setShowCats(false)}
          onChanged={() => { cats.reload(); skills.reload() }} />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete skill?" busy={busy} message={`“${toDelete.name}” will be permanently deleted.`}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
