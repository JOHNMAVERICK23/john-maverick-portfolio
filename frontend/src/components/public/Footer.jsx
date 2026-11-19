export default function Footer({ profile, settings }) {
  const social = profile.social_links || []
  return (
    <footer className="border-t border-slate-200 py-8 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} {settings.site_title || profile.full_name}. All rights reserved.</p>
        {social.length > 0 && (
          <ul className="flex gap-4">
            {social.map((s) => (
              <li key={`${s.platform}-${s.url}`}>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="transition hover:text-brand-blue dark:hover:text-brand-sky">{s.platform}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  )
}
