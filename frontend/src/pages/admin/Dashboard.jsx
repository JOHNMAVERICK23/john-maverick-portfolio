import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Award, Wrench, Briefcase, Mail } from 'lucide-react'
import api, { errMsg } from '../../services/api'

const cards = [
  ['projects', 'Projects', FolderKanban],
  ['certificates', 'Certificates', Award],
  ['skills', 'Skills', Wrench],
  ['experiences', 'Experiences', Briefcase],
  ['messages', 'Messages', Mail],
]

const actions = [
  ['/admin/projects', 'New project'],
  ['/admin/skills', 'Add skill'],
  ['/admin/certificates', 'Add certificate'],
  ['/admin/messages', 'View messages'],
]

const when = (d) => new Date(d).toLocaleString()

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).catch((e) => setError(errMsg(e)))
  }, [])

  if (error) return <p className="text-red-500">{error}</p>
  if (!data) return <p>Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(([key, label, Icon]) => (
          <div key={key} className="card">
            <Icon className="mb-2 text-brand-sky" size={20} />
            <p className="text-2xl font-semibold">{data.counts[key]}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map(([to, label]) => (
          <Link key={to} to={to} className="btn">{label}</Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-medium">Recent messages
            {data.counts.unread_messages > 0 && (
              <span className="ml-2 rounded-full bg-brand-blue px-2 py-0.5 text-xs text-white">
                {data.counts.unread_messages} unread
              </span>
            )}
          </h2>
          {data.recent_messages.length === 0
            ? <p className="text-sm text-slate-500">No messages yet.</p>
            : <ul className="divide-y divide-slate-200 dark:divide-white/10">
                {data.recent_messages.map((m) => (
                  <li key={m.id} className="py-2 text-sm">
                    <p className={m.is_read ? '' : 'font-semibold'}>{m.name} · {m.subject || 'No subject'}</p>
                    <p className="text-xs text-slate-500">{when(m.created_at)}</p>
                  </li>
                ))}
              </ul>}
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium">Recent activity</h2>
          {data.recent_activities.length === 0
            ? <p className="text-sm text-slate-500">No activity yet.</p>
            : <ul className="divide-y divide-slate-200 dark:divide-white/10">
                {data.recent_activities.map((a) => (
                  <li key={a.id} className="py-2 text-sm">
                    <p>{a.description}</p>
                    <p className="text-xs text-slate-500">{a.admin_name || 'Admin'} · {when(a.created_at)}</p>
                  </li>
                ))}
              </ul>}
        </section>
      </div>
    </div>
  )
}
