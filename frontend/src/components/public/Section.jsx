export default function Section({ id, title, subtitle, alt = false, children }) {
  return (
    <section id={id} className={`scroll-mt-16 py-20 ${alt ? 'bg-white/60 dark:bg-brand-black/40' : ''}`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-gradient-to-r from-brand-blue to-brand-sky" />
          {subtitle && <p className="mt-3 text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}
