import { useState } from 'react'
import { Mail, MailOpen, Trash2, Search } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import useList from '../../hooks/useList'
import useDebounce from '../../hooks/useDebounce'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'

const LIMIT = 10

export default function Messages() {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [read, setRead] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const search = useDebounce(q)

  const { data, total, loading, error, reload } = useList('/admin/messages', {
    q: search || undefined, read: read || undefined, page, limit: LIMIT,
  })

  const mark = async (m, is_read) => {
    try {
      const { data: row } = await api.patch(`/admin/messages/${m.id}`, { is_read })
      setSelected((s) => (s && s.id === m.id ? row : s))
      reload()
    } catch (e) { toast(errMsg(e), 'error') }
  }

  const open = (m) => {
    setSelected(m)
    if (!m.is_read) mark(m, true)
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/admin/messages/${toDelete.id}`)
      toast('Message deleted')
      setToDelete(null)
      setSelected(null)
      if (data.length === 1 && page > 1) setPage(page - 1)
      else reload()
    } catch (e) { toast(errMsg(e), 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Messages</h1>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input className="input pl-9" placeholder="Search name, email, subject, message"
            aria-label="Search messages" value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        </div>
        <select className="input sm:w-40" aria-label="Filter" value={read}
          onChange={(e) => { setRead(e.target.value); setPage(1) }}>
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && data.length === 0 && (
        <div className="card text-center text-sm text-slate-500">No messages found.</div>
      )}

      {data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/10">
              <tr>
                <th className="p-3">From</th><th className="p-3">Subject</th>
                <th className="p-3">Date</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {data.map((m) => (
                <tr key={m.id} onClick={() => open(m)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className={`p-3 ${m.is_read ? '' : 'font-semibold'}`}>
                    {!m.is_read && <span aria-label="Unread" className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-sky" />}
                    {m.name}
                    <div className="text-xs font-normal text-slate-500">{m.email}</div>
                  </td>
                  <td className="p-3">{m.subject || <span className="text-slate-400">No subject</span>}</td>
                  <td className="whitespace-nowrap p-3 text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button aria-label="Delete message" className="rounded p-2 text-red-500 hover:bg-red-500/10"
                      onClick={(e) => { e.stopPropagation(); setToDelete(m) }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} limit={LIMIT} total={total} onChange={setPage} />

      {selected && (
        <Modal title={selected.subject || 'No subject'} onClose={() => setSelected(null)} wide>
          <p className="text-sm"><strong>{selected.name}</strong> · {selected.email}</p>
          <p className="mb-4 text-xs text-slate-500">{new Date(selected.created_at).toLocaleString()}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{selected.message}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <a className="btn" href={`mailto:${selected.email}`}>Reply</a>
            <button className="btn" onClick={() => mark(selected, !selected.is_read)}>
              {selected.is_read ? <><Mail size={16} /> Mark unread</> : <><MailOpen size={16} /> Mark read</>}
            </button>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={() => setToDelete(selected)}>Delete</button>
          </div>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog title="Delete message?" busy={busy}
          message={`This permanently deletes the message from ${toDelete.name}.`}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
