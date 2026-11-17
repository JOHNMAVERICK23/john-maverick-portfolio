import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function CategoryManager({ categories, onChanged, onClose }) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      await fn()
      toast(okMsg)
      onChanged()
      return true
    } catch (e) {
      toast(errMsg(e), 'error')
      return false
    } finally { setBusy(false) }
  }

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (await run(() => api.post('/admin/skill-categories', { name }), 'Category added')) setName('')
  }

  const rename = async () => {
    if (!editName.trim()) return
    const url = `/admin/skill-categories/${editId}`
    if (await run(() => api.put(url, { name: editName }), 'Category renamed')) setEditId(null)
  }

  const remove = async () => {
    const url = `/admin/skill-categories/${toDelete.id}`
    if (await run(() => api.delete(url), 'Category deleted')) setToDelete(null)
  }

  return (
    <Modal title="Skill categories" onClose={onClose}>
      <form onSubmit={add} className="mb-4 flex gap-2">
        <input className="input" placeholder="New category" aria-label="New category"
          value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        <button className="btn" disabled={busy}>Add</button>
      </form>
      {categories.length === 0 && <p className="text-sm text-slate-500">No categories yet.</p>}
      <ul className="divide-y divide-slate-200 dark:divide-white/10">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
            {editId === c.id ? (
              <>
                <input className="input" aria-label="Category name" value={editName} maxLength={100}
                  onChange={(e) => setEditName(e.target.value)} />
                <button aria-label="Save" onClick={rename} disabled={busy} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Check size={16} /></button>
                <button aria-label="Cancel" onClick={() => setEditId(null)} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><X size={16} /></button>
              </>
            ) : (
              <>
                <span>{c.name}</span>
                <span className="whitespace-nowrap">
                  <button aria-label="Rename" onClick={() => { setEditId(c.id); setEditName(c.name) }} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Pencil size={16} /></button>
                  <button aria-label="Delete" onClick={() => setToDelete(c)} className="rounded p-2 text-red-500 hover:bg-red-500/10"><Trash2 size={16} /></button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      {toDelete && (
        <ConfirmDialog title="Delete category?" busy={busy}
          message={`“${toDelete.name}” will be deleted. Its skills become uncategorized.`}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </Modal>
  )
}
