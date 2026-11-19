import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import api, { errMsg } from '../../services/api'
import Section from './Section'
import Field from '../ui/Field'

const EMPTY = { name: '', email: '', subject: '', message: '' }

const validate = (f) => {
  const e = {}
  const name = f.name.trim()
  const msg = f.message.trim().length
  if (name.length < 2 || name.length > 100) e.name = 'Name must be 2 to 100 characters'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address'
  if (f.subject.trim().length > 200) e.subject = 'Subject is too long (max 200)'
  if (msg < 10 || msg > 5000) e.message = 'Message must be 10 to 5000 characters'
  return e
}

const FieldError = ({ text }) =>
  text ? <p role="alert" className="mt-1 text-xs text-red-500">{text}</p> : null

export default function Contact({ profile }) {
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', text: '' })
    const found = validate(f)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await api.post('/contact', f)
      setF(EMPTY)
      setStatus({ type: 'ok', text: 'Thanks! Your message was sent.' })
    } catch (err) {
      const list = err.response?.data?.errors
      if (Array.isArray(list)) setErrors(Object.fromEntries(list.map((x) => [x.field, x.message])))
      else setStatus({ type: 'error', text: errMsg(err) })
    } finally { setBusy(false) }
  }

  const info = [
    [Mail, profile.email, profile.email && `mailto:${profile.email}`],
    [Phone, profile.phone, profile.phone && `tel:${profile.phone.replace(/[^\d+]/g, '')}`],
    [MapPin, profile.location, null],
  ].filter((row) => row[1])
  const social = profile.social_links || []

  return (
    <Section id="contact" title="Get in touch" subtitle="Have a project or an opportunity in mind? Send me a message.">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-5">
        <div className="space-y-4 md:col-span-2">
          <ul className="space-y-3 text-sm">
            {info.map(([Icon, value, href]) => (
              <li key={value} className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-brand-sky" aria-hidden="true" />
                <span className="min-w-0 break-words">
                  {href
                    ? <a href={href} className="hover:text-brand-blue dark:hover:text-brand-sky">{value}</a>
                    : value}
                </span>
              </li>
            ))}
          </ul>
          {social.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {social.map((s) => (
                <li key={`${s.platform}-${s.url}`}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="rounded-full border border-slate-300 px-3 py-1 text-sm transition hover:border-brand-sky hover:text-brand-blue dark:border-white/15 dark:hover:text-brand-sky">
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={submit} noValidate className="card space-y-4 md:col-span-3">
          {status.text && (
            <p role={status.type === 'error' ? 'alert' : 'status'}
              className={`rounded-lg p-3 text-sm ${status.type === 'ok' ? 'bg-brand-sky/15 text-brand-blue dark:text-brand-sky' : 'bg-red-500/10 text-red-500'}`}>
              {status.text}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *" id="ct-name">
              <input id="ct-name" className="input" autoComplete="name" value={f.name}
                aria-invalid={Boolean(errors.name)} onChange={set('name')} />
              <FieldError text={errors.name} />
            </Field>
            <Field label="Email *" id="ct-email">
              <input id="ct-email" type="email" className="input" autoComplete="email" value={f.email}
                aria-invalid={Boolean(errors.email)} onChange={set('email')} />
              <FieldError text={errors.email} />
            </Field>
          </div>
          <Field label="Subject" id="ct-subject">
            <input id="ct-subject" className="input" value={f.subject}
              aria-invalid={Boolean(errors.subject)} onChange={set('subject')} />
            <FieldError text={errors.subject} />
          </Field>
          <Field label="Message *" id="ct-message">
            <textarea id="ct-message" rows={5} className="input" value={f.message}
              aria-invalid={Boolean(errors.message)} onChange={set('message')} />
            <div className="flex justify-between">
              <FieldError text={errors.message} />
              <span className="ml-auto text-xs text-slate-500">{f.message.length}/5000</span>
            </div>
          </Field>
          <button className="btn" disabled={busy}>
            <Send size={16} /> {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </Section>
  )
}
