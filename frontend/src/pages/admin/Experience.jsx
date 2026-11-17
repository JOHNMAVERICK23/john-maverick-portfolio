import ResourcePage from '../../components/admin/ResourcePage'
import ExperienceForm from '../../components/admin/ExperienceForm'
import { fmtMonth } from '../../utils/format'

const columns = [
  {
    label: 'Role',
    render: (r) => (
      <>
        <p className="font-medium">{r.position}</p>
        <p className="text-xs text-slate-500">{r.company}</p>
      </>
    ),
  },
  { label: 'Type', render: (r) => r.employment_type || '—' },
  {
    label: 'Period',
    render: (r) => `${fmtMonth(r.start_date)} – ${r.is_current ? 'Present' : fmtMonth(r.end_date) || '—'}`,
  },
]

export default function Experience() {
  return (
    <ResourcePage title="Experience" noun="Experience" path="/admin/experiences"
      columns={columns} Form={ExperienceForm} label={(r) => `${r.position} at ${r.company}`} />
  )
}
