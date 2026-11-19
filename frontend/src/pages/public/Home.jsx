import { useEffect } from 'react'
import { PublicProvider, usePublic } from '../../context/PublicDataContext'
import useTheme from '../../hooks/useTheme'
import Navbar from '../../components/public/Navbar'
import Hero from '../../components/public/Hero'
import Footer from '../../components/public/Footer'

const setMeta = (name, content) => {
  if (!content) return
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

const setFavicon = (href) => {
  let el = document.querySelector("link[rel~='icon']")
  if (!el) {
    el = document.createElement('link')
    el.rel = 'icon'
    document.head.appendChild(el)
  }
  el.href = href
}

function Site() {
  const [theme, toggleTheme] = useTheme()
  const { loading, error, data } = usePublic()

  useEffect(() => {
    if (!data) return
    const { settings, profile } = data
    document.title = settings.seo_title || settings.site_title || profile.full_name
    setMeta('description', settings.seo_description)
    if (settings.favicon_url) setFavicon(settings.favicon_url)
  }, [data])

  if (loading) return <div className="grid min-h-screen place-items-center">Loading…</div>

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div className="space-y-4">
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    )
  }

  const { profile, settings } = data
  return (
    <>
      <Navbar settings={settings} profile={profile} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero profile={profile} settings={settings} />
      </main>
      <Footer profile={profile} settings={settings} />
    </>
  )
}

export default function Home() {
  return (
    <PublicProvider>
      <Site />
    </PublicProvider>
  )
}
