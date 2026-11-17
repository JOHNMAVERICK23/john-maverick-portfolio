import { useEffect, useState } from 'react'
import api, { errMsg } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Field from '../../components/ui/Field'
import SocialLinksManager from '../../components/admin/SocialLinksManager'

const IMG = ['image/jpeg', 'image/png', 'image/webp']
const MAX = 10 * 1024 * 1024
const FIELDS = ['full_name', 'title', 'introduction', 'hero_description', 'email', 'phone', 'location']

export default function Profile() {
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [f, setF] = useState(null)
  const [image, setImage] = useState(null)
  const [resume, setResume] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/admin/profile')
      .then(({ data }) => {
        setProfile(data)
        setF(Object.fromEntries(FIELDS.map((k) => [k, data[k] || ''])))
      })
      .catch((e) => setError(errMsg(e)))
  }, [])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.full_name.trim()) return setError('Full name is required')
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Email is invalid')
    if (image && (!IMG.includes(image.type) || image.size > MAX)) {
      return setError('Profile picture must be JPG, PNG or WebP, max 10 MB')
    }
    if (resume && (resume.type !== 'application/pdf' || resume.size > MAX)) {
      return setError('Resume must be a PDF, max 10 MB')
    }
    const fd = new FormData()
    FIELDS.forEach((k) => fd.append(k, f[k]))
    if (image) fd.append('profile_image', image)
    if (resume) fd.append('resume', resume)
    setBusy(true)
    try {
      const { data } = await api.put('/admin/profile', fd)
      setProfile(data)
      setImage(null)
      setResume(null)
      setFileKey((k) => k + 1)
      toast('Profile saved')
    } catch (err) { setError(errMsg(err)) }
    finally { setBusy(false) }
  }

  if (!f) return error ? <p className="text-red-500">{error}</p> : <p>Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <form onSubmit={submit} className="card space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name *" id="pr-name">
            <input id="pr-name" className="input" value={f.full_name} onChange={set('full_name')} />
          </Field>
          <Field label="Professional title" id="pr-title">
            <input id="pr-title" className="input" value={f.title} onChange={set('title')} placeholder="Full-Stack Developer" />
          </Field>
        </div>
        <Field label="Introduction" id="pr-intro">
          <textarea id="pr-intro" rows={3} className="input" value={f.introduction} onChange={set('introduction')} />
        </Field>
        <Field label="Hero description" id="pr-hero" hint="Shown under your name on the home page.">
          <textarea id="pr-hero" rows={3} className="input" value={f.hero_description} onChange={set('hero_description')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Email" id="pr-email">
            <input id="pr-email" type="email" className="input" value={f.email} onChange={set('email')} />
          </Field>
          <Field label="Phone" id="pr-phone">
            <input id="pr-phone" className="input" value={f.phone} onChange={set('phone')} />
          </Field>
          <Field label="Location" id="pr-loc">
            <input id="pr-loc" className="input" value={f.location} onChange={set('location')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Profile picture" id="pr-img">
            {profile.profile_image && (
              <img src={profile.profile_image} alt="Current profile" className="mb-2 h-24 w-24 rounded-full object-cover" />
            )}
            <input key={`i${fileKey}`} id="pr-img" type="file" className="input"
              accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files[0] || null)} />
          </Field>
          <Field label="Resume (PDF)" id="pr-resume">
            {profile.resume_file && (
              <a href={profile.resume_file} target="_blank" rel="noreferrer"
                className="mb-2 block text-sm text-brand-blue hover:underline">View current resume</a>
            )}
            <input key={`r${fileKey}`} id="pr-resume" type="file" className="input"
              accept="application/pdf" onChange={(e) => setResume(e.target.files[0] || null)} />
          </Field>
        </div>

        <div className="flex justify-end">
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>

      <SocialLinksManager />
    </div>
  )
}
