import { Award, ExternalLink } from 'lucide-react'
import Section from './Section'
import { fmtMonth } from '../../utils/format'

const isPdf = (url) => /\.pdf$/i.test(url)

export default function Certificates({ items }) {
  return (
    <Section id="certificates" title="Certificates" subtitle="Training and credentials">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <article key={c.id} className="card flex flex-col overflow-hidden p-0">
            {c.file_url && !isPdf(c.file_url)
              ? <img src={c.file_url} alt={`${c.title} certificate`} loading="lazy" className="h-40 w-full object-cover" />
              : <div aria-hidden="true" className="grid h-40 place-items-center bg-brand-blue/10 dark:bg-brand-sky/10">
                  <Award size={40} className="text-brand-blue dark:text-brand-sky" />
                </div>}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-brand-blue dark:text-brand-sky">{c.issuer}</p>
              {c.issue_date && <p className="text-xs text-slate-500">{fmtMonth(c.issue_date)}</p>}
              {c.description && <p className="text-sm text-slate-600 dark:text-slate-300">{c.description}</p>}
              <div className="mt-auto flex flex-wrap gap-4 pt-2 text-sm">
                {c.file_url && (
                  <a href={c.file_url} target="_blank" rel="noopener noreferrer"
                    className="font-medium text-brand-blue hover:underline dark:text-brand-sky">View certificate</a>
                )}
                {c.credential_url && (
                  <a href={c.credential_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-brand-sky">
                    Verify <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
