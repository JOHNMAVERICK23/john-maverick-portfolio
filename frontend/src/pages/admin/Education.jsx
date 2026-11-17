import ResourcePage from '../../components/admin/ResourcePage'
import EducationForm from '../../components/admin/EducationForm'

const columns = [
  {
    label: 'School',
    render: (r) => (
      <>
        <p className="font-medium">{r.school_name}</p>
        <p className="text-xs text-slate-500">{r.degree}</p>
      </>
    ),
  },
  { label: 'Years', render: (r) => `${r.year_started || '?'} – ${r.year_completed || 'Present'}` },
]

export default function Education() {
  return (
    <ResourcePage title="Education" noun="Education" path="/admin/education"
      columns={columns} Form={EducationForm} label={(r) => r.school_name} />
  )
}
