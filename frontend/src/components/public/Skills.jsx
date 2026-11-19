import Section from './Section'

export default function Skills({ categories }) {
  const shown = categories.filter((c) => c.skills.length > 0)
  return (
    <Section id="skills" title="Skills" subtitle="Technologies and tools I work with" alt>
      <div className="grid gap-6 md:grid-cols-2">
        {shown.map((c) => (
          <div key={c.id} className="card">
            <h3 className="mb-4 font-semibold text-brand-blue dark:text-brand-sky">{c.name}</h3>
            <ul className="space-y-4">
              {c.skills.map((s) => (
                <li key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {s.icon && <img src={s.icon} alt="" className="h-5 w-5 object-contain" />}
                      {s.name}
                    </span>
                    <span className="text-xs text-slate-500">{s.proficiency}%</span>
                  </div>
                  <div role="progressbar" aria-label={`${s.name} proficiency`}
                    aria-valuenow={s.proficiency} aria-valuemin={0} aria-valuemax={100}
                    className="h-2 rounded bg-slate-200 dark:bg-white/10">
                    <div className="h-2 rounded bg-gradient-to-r from-brand-blue to-brand-sky"
                      style={{ width: `${s.proficiency}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
