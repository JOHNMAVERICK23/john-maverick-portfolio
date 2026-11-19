import { visibleSections } from '../../utils/sections'
import About from './About'
import Skills from './Skills'
import Projects from './Projects'
import Experience from './Experience'
import Certificates from './Certificates'
import Education from './Education'
import Contact from './Contact'

export default function Sections({ data }) {
  const show = visibleSections(data)
  return (
    <>
      {show.about && <About profile={data.profile} />}
      {show.skills && <Skills categories={data.skills} />}
      {show.projects && <Projects projects={data.projects} />}
      {show.experience && <Experience items={data.experiences} />}
      {show.certificates && <Certificates items={data.certificates} />}
      {show.education && <Education items={data.education} />}
      {show.contact && <Contact profile={data.profile} />}
    </>
  )
}
