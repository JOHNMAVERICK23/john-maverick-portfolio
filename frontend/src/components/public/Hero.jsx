import { Download, ExternalLink } from 'lucide-react'
import { usePublic } from '../../context/PublicDataContext'
import { visibleSections } from '../../utils/sections'

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

export default function Hero({ profile }) {
  const { data } = usePublic()
  const sections = visibleSections(data)
  const social = profile.social_links || []

  return (
    <section id="home" className="flex min-h-screen items-center pt-24 pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="order-last space-y-5 md:order-first">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-blue dark:text-brand-sky">
            Hi, I&rsquo;m
          </p>
          <h1 className="bg-gradient-to-r from-brand-blue to-brand-sky bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            {profile.full_name}
          </h1>
          {profile.title && <h2 className="text-xl font-medium sm:text-2xl">{profile.title}</h2>}
          {profile.introduction && (
            <p className="text-slate-600 dark:text-slate-300">{profile.introduction}</p>
          )}
          {profile.hero_description && (
            <p className="text-slate-600 dark:text-slate-400">{profile.hero_description}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {sections.projects !== false && <a href="#projects" className="btn">View projects</a>}
            {sections.contact !== false && (
              <a href="#contact"
                className="inline-flex items-center rounded-lg border border-brand-blue px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue hover:text-white dark:border-brand-sky dark:text-brand-sky dark:hover:bg-brand-sky dark:hover:text-brand-darker">
                Contact me
              </a>
            )}
            {profile.resume_file && (
              <a href={profile.resume_file} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-white/10">
                <Download size={16} /> Resume
              </a>
            )}
          </div>

          {social.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2" aria-label="Social links">
              {social.map((s) => (
                <li key={`${s.platform}-${s.url}`}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-sm transition hover:border-brand-sky hover:text-brand-blue dark:border-white/15 dark:hover:text-brand-sky">
                    {s.platform} <ExternalLink size={12} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-first flex justify-center md:order-last">
          {profile.profile_image
            ? <img src={profile.profile_image} alt={profile.full_name}
                className="h-56 w-56 rounded-full object-cover ring-4 ring-brand-sky/40 sm:h-72 sm:w-72" />
            : <div aria-hidden="true"
                className="grid h-56 w-56 place-items-center rounded-full bg-brand-blue text-6xl font-bold text-white ring-4 ring-brand-sky/40 sm:h-72 sm:w-72">
                {initials(profile.full_name)}
              </div>}
        </div>
      </div>
    </section>
  )
}
