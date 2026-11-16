import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, Info, FolderKanban, Wrench, Briefcase, Award,
  GraduationCap, Mail, Settings, Menu, X, Sun, Moon, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useTheme from '../hooks/useTheme'

const nav = [
  ['/admin/dashboard', 'Dashboard', LayoutDashboard],
  ['/admin/profile', 'Profile', User],
  ['/admin/about', 'About', Info],
  ['/admin/projects', 'Projects', FolderKanban],
  ['/admin/skills', 'Skills', Wrench],
  ['/admin/experience', 'Experience', Briefcase],
  ['/admin/certificates', 'Certificates', Award],
  ['/admin/education', 'Education', GraduationCap],
  ['/admin/messages', 'Messages', Mail],
  ['/admin/settings', 'Settings', Settings],
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:flex">
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-brand-black p-4 text-brand-gray transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between px-2">
          <span className="text-lg font-semibold text-brand-sky">Portfolio CMS</span>
          <button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1" aria-label="Admin">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-brand-blue text-white' : 'hover:bg-white/10 hover:text-brand-sky'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-brand-black">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 lg:block">
            Signed in as {admin?.name}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
