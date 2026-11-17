import ResourcePage from '../../components/admin/ResourcePage'
import CertificateForm from '../../components/admin/CertificateForm'
import { fmtMonth } from '../../utils/format'

const columns = [
  {
    label: 'Certificate',
    render: (r) => (
      <>
        <p className="font-medium">{r.title}</p>
        <p className="text-xs text-slate-500">{r.issuer}</p>
      </>
    ),
  },
  { label: 'Issued', render: (r) => fmtMonth(r.issue_date) || '—' },
  {
    label: 'File',
    render: (r) => r.file_url
      ? <a href={r.file_url} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">View</a>
      : '—',
  },
  {
    label: 'Status',
    render: (r) => r.is_published ? 'Published' : <span className="text-amber-500">Hidden</span>,
  },
]

export default function Certificates() {
  return (
    <ResourcePage title="Certificates" noun="Certificate" path="/admin/certificates"
      columns={columns} Form={CertificateForm} label={(r) => r.title} publishField="is_published" />
  )
}
