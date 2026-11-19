import Section from './Section'
import { fmtMonth } from '../../utils/format'

const chip = 'rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs text-brand-blue dark:bg-brand-sky/10 dark:text-brand-sky'

export default function Experience({ items }) {
  return (
    <Section id="experience" title="Experience" subtitle="Where I have worked and trained" alt>
      <ol className="relative mx-auto max-w-3xl space-y-8 border-l border-slate-300 pl-6 dark:border-white/15">
        {items.map((x) => (
          <li key={x.id} className="relative">
            <span aria-hidden="true"
              className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-brand-sky ring-4 ring-brand-gray dark:ring-brand-darker" />
            <h3 className="font-semibold">{x.position}</h3>
            <p className="text-sm text-brand-blue dark:text-brand-sky">
              {x.company}{x.employment_type ? ` · ${x.employment_type}` : ''}
            </p>
            <p className="mb-2 text-xs text-slate-500">
              {fmtMonth(x.start_date)} – {x.is_current ? 'Present' : fmtMonth(x.end_date) || '—'}
            </p>
            {(x.responsibilities || []).length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {x.responsibilities.map((r, i) => <li key={`${i}-${r}`}>{r}</li>)}
              </ul>
            )}
            {(x.technologies || []).length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {x.technologies.map((t) => <li key={t} className={chip}>{t}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}
