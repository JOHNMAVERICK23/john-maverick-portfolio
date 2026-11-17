import { useState } from 'react'
import { Pencil, Trash2, Check, X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import useList from '../../hooks/useList'
import { useToast } from '../../context/ToastContext'
import ConfirmDialog from '../ui/ConfirmDialog'

const PLATFORMS = ['GitHub', 'LinkedIn', 'Facebook', 'Instagram', 'X', 'YouTube', 'Website']
const validUrl = (u) => /^https?:\/\/\S+$/i.test(u.trim())
const URL_ERR = 'URL must start with http:// or https://'

export default function SocialLinksManager() {
  const toast = useToast()
  const { data, loading, error, reload } = useList('/admin/social-links', { limit: 100 })
  const [add, setAdd] = useState({ platform: 'GitHub', url: '' })
  const [editId, setEditId] = useState(null)
  const [edit, setEdit] = useState({ platform: '', url: '' })
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      await fn()
      if (okMsg) toast(okMsg)
      reload()
      return true
    } catch (e) {
      toast(errMsg(e), 'error')
      return false
    } finally { setBusy(false) }
  }

  const create = async (e) => {
    e.preventDefault()
    if (!validUrl(add.url)) return toast(URL_ERR, 'error')
    if (await run(() => api.post('/admin/social-links', add), 'Link added')) {
      setAdd({ ...add, url: '' })
    }
  }

  const save = async () => {
    if (!validUrl(edit.url)) return toast(URL_ERR, 'error')
    if (await run(() => api.put(`/admin/social-links/${editId}`, edit), 'Link updated')) {
      setEditId(null)
    }
  }

  const move = (i, dir) => {
    const ids = data.map((l) => l.id)
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    const tmp = ids[i]
    ids[i] = ids[j]
    ids[j] = tmp
    run(() => api.put('/admin/social-links/reorder', { ids }))
  }

  const toggle = (l) =>
    run(() => api.put(`/admin/social-links/${l.id}`, { is_visible: !l.is_visible }))

  const remove = async () => {
    if (await run(() => api.delete(`/admin/social-links/${toDelete.id}`), 'Link deleted')) {
      setToDelete(null)
    }
  }

  const options = (current) =>
    (PLATFORMS.includes(current) || !current ? PLATFORMS : [current, ...PLATFORMS])

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">Social links</h2>

      <form onSubmit={create} className="flex flex-col gap-2 sm:flex-row">
        <select className="input sm:w-40" aria-label="Platform" value={add.platform}
          onChange={(e) => setAdd({ ...add, platform: e.target.value })}>
          {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input className="input" placeholder="https://..." aria-label="URL" value={add.url}
          onChange={(e) => setAdd({ ...add, url: e.target.value })} />
        <button className="btn" disabled={busy}>Add</button>
      </form>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-sm">Loading…</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-slate-500">No social links yet.</p>
      )}

      <ul className="divide-y divide-slate-200 dark:divide-white/10">
        {data.map((l, i) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
            {editId === l.id ? (
              <>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <select className="input sm:w-40" aria-label="Platform" value={edit.platform}
                    onChange={(e) => setEdit({ ...edit, platform: e.target.value })}>
                    {options(edit.platform).map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <input className="input" aria-label="URL" value={edit.url}
                    onChange={(e) => setEdit({ ...edit, url: e.target.value })} />
                </div>
                <span className="whitespace-nowrap">
                  <button aria-label="Save" onClick={save} disabled={busy}
                    className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Check size={16} /></button>
                  <button aria-label="Cancel" onClick={() => setEditId(null)}
                    className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><X size={16} /></button>
                </span>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${l.is_visible ? '' : 'text-slate-400'}`}>
                    {l.platform}{!l.is_visible && ' (hidden)'}
                  </p>
                  <p className="truncate text-xs text-slate-500">{l.url}</p>
                </div>
                <span className="whitespace-nowrap">
                  <button aria-label="Move up" disabled={i === 0 || busy} onClick={() => move(i, -1)}
                    className="rounded p-2 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10"><ArrowUp size={16} /></button>
                  <button aria-label="Move down" disabled={i === data.length - 1 || busy} onClick={() => move(i, 1)}
                    className="rounded p-2 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10"><ArrowDown size={16} /></button>
                  <button aria-label={l.is_visible ? 'Hide' : 'Show'} onClick={() => toggle(l)} disabled={busy}
                    className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10">
                    {l.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button aria-label="Edit" onClick={() => { setEditId(l.id); setEdit({ platform: l.platform, url: l.url }) }}
                    className="rounded p-2 hover:bg-slate-100 dark:hover:bg-white/10"><Pencil size={16} /></button>
                  <button aria-label="Delete" onClick={() => setToDelete(l)}
                    className="rounded p-2 text-red-500 hover:bg-red-500/10"><Trash2 size={16} /></button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog title="Delete link?" busy={busy}
          message={`The ${toDelete.platform} link will be permanently deleted.`}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </section>
  )
}
