import { Mail, Phone, MapPin } from 'lucide-react'
import Section from './Section'

export default function About({ profile }) {
  const info = [
    [Mail, 'Email', profile.email, profile.email && `mailto:${profile.email}`],
    [Phone, 'Phone', profile.phone, profile.phone && `tel:${profile.phone.replace(/[^\d+]/g, '')}`],
    [MapPin, 'Location', profile.location, null],
  ].filter((row) => row[2])

  return (
    <Section id="about" title="About me">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {profile.biography && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Biography</h3>
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{profile.biography}</p>
            </div>
          )}
          {profile.career_goals && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Career goals</h3>
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{profile.career_goals}</p>
            </div>
          )}
        </div>
        {info.length > 0 && (
          <div className="card h-fit">
            <h3 className="mb-3 text-lg font-semibold">Personal information</h3>
            <ul className="space-y-3 text-sm">
              {info.map(([Icon, label, value, href]) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-brand-sky" aria-hidden="true" />
                  <span className="min-w-0 break-words">
                    {href
                      ? <a href={href} className="hover:text-brand-blue dark:hover:text-brand-sky">{value}</a>
                      : value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  )
}
