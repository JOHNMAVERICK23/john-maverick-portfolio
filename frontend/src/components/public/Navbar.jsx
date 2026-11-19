import { useState } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { usePublic } from '../../context/PublicDataContext'
import { visibleSections } from '../../utils/sections'

const LINKS = [
  ['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'],
  ['experience', 'Experience'], ['certificates', 'Certificates'],
  ['education', 'Education'], ['contact', 'Contact'],
]

export default function Navbar({ settings, profile, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const { data } = usePublic()
  const visible = visibleSections(data)
  const links = LINKS.filter(([key]) => visible[key])
  const brand = settings.site_title || profile.full_name

  const linkCls = 'rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:text-brand-blue dark:text-slate-300 dark:hover:text-brand-sky'

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-brand-darker/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#home" className="flex items-center font-semibold">
          {settings.logo_url
            ? <img src={settings.logo_url} alt={brand} className="h-8 object-contain" />
            : <span className="text-brand-blue dark:text-brand-sky">{brand}</span>}
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map(([key, label]) => (
            <a key={key} href={`#${key}`} className={linkCls}>{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button onClick={onToggleTheme} aria-label="Toggle theme"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
            onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-slate-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-brand-darker lg:hidden">
          {links.map(([key, label]) => (
            <a key={key} href={`#${key}`} onClick={() => setOpen(false)} className={`block ${linkCls}`}>{label}</a>
          ))}
        </nav>
      )}
    </header>
  )
}
