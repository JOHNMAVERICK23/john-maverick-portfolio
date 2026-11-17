import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import useList from '../../hooks/useList'
import useDebounce from '../../hooks/useDebounce'
import { useToast } from '../../context/ToastContext'
import ConfirmDialog from '../ui/ConfirmDialog'
import Pagination from '../ui/Pagination'

const LIMIT = 10

export default function ResourcePage({ title, noun, path, columns, Form, label, publishField }) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const search = useDebounce(q)
  const { data, total, loading, error, reload } = useList(path, {
    q: search || undefined, page, limit: LIMIT,
  })

  const togglePublish = async (row) => {
    try {
      await api.put(`${path}/${row.id}`, { [publishField]: !row[publishField] })
      toast(row[publishField] ? 'Unpublished' : 'Published')
      reload()
    } catch (e) { toast(errMsg(e), 'error') }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`${path}/${toDelete.id}`)
      toast(`${noun} deleted`)
      setToDelete(null)
      if (data.length === 1 && page > 1) setPage(page - 1)
      else reload()
    } catch (e) { toast(errMsg(e), 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <button className="btn" onClick={() => setEditing({})}><Plus size={16} /> Add {noun.toLowerCase()}</button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input className="input pl-9" placeholder={`Search ${title.toLowerCase()}`}
          aria-label={`Search ${title}`} value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && data.length === 0 && (
        <div className="card text-center text-sm text-slate-500">
          Nothing here yet. Click “Add {noun.toLowerCase()}”.
        </div>
      )}

      {data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/10">
              <tr>
                {columns.map((c) => <th key={c.label} className="p-3">{c.label}</th>)}
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {data.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => <td key={c.label} className="p-3">{c.render(row)}</td>)}
                  <td className="whitespace-nowrap p-3 text-right">
                    {publishField && (
                      <button aria-label={row[publishField] ? 'Unpublish' : 'Publish'}
                        onClick={() => togglePublish(row)}
                        className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10">
                        {row[publishField] ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                    <button aria-label="Edit" onClick={() => setEditing(row)}
                      className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Pencil size={16} /></button>
                    <button aria-label="Delete" onClick={() => setToDelete(row)}
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
        <Form item={editing.id ? editing : null} onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); toast(`${noun} saved`); reload() }} />
      )}

      {toDelete && (
        <ConfirmDialog title={`Delete ${noun.toLowerCase()}?`} busy={busy}
          message={`“${label(toDelete)}” will be permanently deleted.`}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
