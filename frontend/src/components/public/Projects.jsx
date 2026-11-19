import { useMemo, useState } from 'react'
import { Code, ExternalLink, Star } from 'lucide-react'
import Section from './Section'
import ProjectModal from './ProjectModal'
import { PROJECT_STATUS } from '../../utils/format'

const chip = 'rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs text-brand-blue dark:bg-brand-sky/10 dark:text-brand-sky'

export default function Projects({ projects }) {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const categories = useMemo(
    () => ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))],
    [projects],
  )
  const list = useMemo(
    () => projects
      .filter((p) => filter === 'All' || p.category === filter)
      .sort((a, b) => Number(b.is_featured) - Number(a.is_featured)),
    [projects, filter],
  )

  return (
    <Section id="projects" title="Projects" subtitle="Things I have built">
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setFilter(c)} aria-pressed={filter === c}
              className={`rounded-full px-4 py-1.5 text-sm transition ${filter === c
                ? 'bg-brand-blue text-white'
                : 'border border-slate-300 hover:border-brand-sky dark:border-white/15'}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <article key={p.id}
            className="card flex flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:border-brand-sky/60">
            {p.thumbnail
              ? <img src={p.thumbnail} alt={`${p.title} thumbnail`} loading="lazy" className="h-44 w-full object-cover" />
              : <div aria-hidden="true" className="h-44 w-full bg-gradient-to-br from-brand-blue to-brand-sky opacity-80" />}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{p.title}</h3>
                {p.is_featured && <Star size={16} className="mt-1 shrink-0 text-brand-sky" aria-label="Featured" />}
              </div>
              <p className="text-xs text-slate-500">
                {PROJECT_STATUS[p.status]}{p.category ? ` · ${p.category}` : ''}
              </p>
              {p.description && (
                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
              )}
              {(p.technologies || []).length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {p.technologies.slice(0, 5).map((t) => <li key={t} className={chip}>{t}</li>)}
                </ul>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm">
                <button type="button" onClick={() => setSelected(p)}
                  className="font-medium text-brand-blue hover:underline dark:text-brand-sky">Details</button>
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-brand-sky">
                    <Code size={14} /> Code
                  </a>
                )}
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-blue dark:hover:text-brand-sky">
                    <ExternalLink size={14} /> Live
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </Section>
  )
}
