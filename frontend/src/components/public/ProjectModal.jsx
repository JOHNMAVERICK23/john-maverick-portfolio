import { useState } from 'react'
import { Code, ExternalLink } from 'lucide-react'
import Modal from '../ui/Modal'
import { PROJECT_STATUS } from '../../utils/format'

const chip = 'rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs text-brand-blue dark:bg-brand-sky/10 dark:text-brand-sky'

export default function ProjectModal({ project, onClose }) {
  const gallery = [project.thumbnail, ...(project.images || [])].filter(Boolean)
  const [index, setIndex] = useState(0)
  const techs = project.technologies || []

  return (
    <Modal title={project.title} onClose={onClose} wide>
      {gallery.length > 0 && (
        <div className="mb-4">
          <img src={gallery[index]} alt={`${project.title} screenshot ${index + 1}`}
            className="max-h-80 w-full rounded-lg bg-slate-100 object-contain dark:bg-brand-darker" />
          {gallery.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <button key={`${i}-${src}`} type="button" aria-label={`Show image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`shrink-0 overflow-hidden rounded-lg border-2 ${i === index ? 'border-brand-sky' : 'border-transparent'}`}>
                  <img src={src} alt="" className="h-14 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mb-3 text-xs text-slate-500">
        {PROJECT_STATUS[project.status]}{project.category ? ` · ${project.category}` : ''}
      </p>
      {project.description && (
        <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
      )}
      {techs.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
          {techs.map((t) => <li key={t} className={chip}>{t}</li>)}
        </ul>
      )}
      {(project.github_url || project.live_url) && (
        <div className="mt-5 flex flex-wrap gap-3">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn">
              <Code size={16} /> Source code
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn">
              <ExternalLink size={16} /> Live demo
            </a>
          )}
        </div>
      )}
    </Modal>
  )
}
