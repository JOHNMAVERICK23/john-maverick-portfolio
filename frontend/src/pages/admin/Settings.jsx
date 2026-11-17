import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Field from '../../components/ui/Field'

const IMG = ['image/jpeg', 'image/png', 'image/webp']
const MAX = 10 * 1024 * 1024
const SECTIONS = [
  ['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'],
  ['experience', 'Experience'], ['certificates', 'Certificates'],
  ['education', 'Education'], ['contact', 'Contact'],
]

export default function Settings() {
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [f, setF] = useState(null)
  const [sections, setSections] = useState({})
  const [logo, setLogo] = useState(null)
  const [favicon, setFavicon] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => {
        setSettings(data)
        setF({
          site_title: data.site_title || '',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
        })
        setSections(data.sections || {})
      })
      .catch((e) => setError(errMsg(e)))
  }, [])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.site_title.trim()) return setError('Website title is required')
    if ([logo, favicon].some((x) => x && (!IMG.includes(x.type) || x.size > MAX))) {
      return setError('Logo and favicon must be JPG, PNG or WebP, max 10 MB')
    }
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.append(k, v))
    fd.append('sections', JSON.stringify(sections))
    if (logo) fd.append('logo', logo)
    if (favicon) fd.append('favicon', favicon)
    setBusy(true)
    try {
      const { data } = await api.put('/admin/settings', fd)
      setSettings(data)
      setSections(data.sections || {})
      setLogo(null)
      setFavicon(null)
      setFileKey((k) => k + 1)
      toast('Settings saved')
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  if (!f) return error ? <p className="text-red-500">{error}</p> : <p>Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <form onSubmit={submit} className="space-y-6">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">General and SEO</h2>
          <Field label="Website title *" id="st-title">
            <input id="st-title" className="input" value={f.site_title} onChange={set('site_title')} />
          </Field>
          <Field label="SEO title" id="st-seo">
            <input id="st-seo" className="input" value={f.seo_title} onChange={set('seo_title')} />
          </Field>
          <Field label="SEO description" id="st-desc" hint="Around 150 to 160 characters works best.">
            <textarea id="st-desc" rows={3} className="input" value={f.seo_description} onChange={set('seo_description')} />
          </Field>
        </section>

        <section className="card grid gap-4 sm:grid-cols-2">
          <Field label="Logo" id="st-logo">
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Current logo" className="mb-2 h-14 object-contain" />
            )}
            <input key={`l${fileKey}`} id="st-logo" type="file" className="input"
              accept="image/jpeg,image/png,image/webp" onChange={(e) => setLogo(e.target.files[0] || null)} />
          </Field>
          <Field label="Favicon" id="st-fav" hint="Square PNG, JPG or WebP. SVG is not supported.">
            {settings.favicon_url && (
              <img src={settings.favicon_url} alt="Current favicon" className="mb-2 h-10 w-10 object-contain" />
            )}
            <input key={`f${fileKey}`} id="st-fav" type="file" className="input"
              accept="image/jpeg,image/png,image/webp" onChange={(e) => setFavicon(e.target.files[0] || null)} />
          </Field>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-semibold">Public sections</h2>
          <p className="text-sm text-slate-500">Turn off a section to hide it from the public website.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SECTIONS.map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sections[key] !== false}
                  onChange={(e) => setSections({ ...sections, [key]: e.target.checked })} />
                {label}
              </label>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Social links are managed in <Link to="/admin/profile" className="text-brand-blue hover:underline">Profile</Link>.
          </p>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  )
}
