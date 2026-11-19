import Section from './Section'

export default function Education({ items }) {
  return (
    <Section id="education" title="Education" subtitle="My academic background" alt>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {items.map((x) => (
          <article key={x.id} className="card">
            <p className="text-xs text-slate-500">
              {x.year_started || '?'} – {x.year_completed || 'Present'}
            </p>
            <h3 className="mt-1 font-semibold">{x.degree}</h3>
            <p className="text-sm text-brand-blue dark:text-brand-sky">{x.school_name}</p>
            {x.description && (
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{x.description}</p>
            )}
          </article>
        ))}
      </div>
    </Section>
  )
}
