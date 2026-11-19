export const visibleSections = (data) => {
  const on = (k) => data.settings.sections?.[k] !== false
  const p = data.profile
  return {
    about: on('about') && Boolean(p.biography || p.career_goals || p.email || p.phone || p.location),
    skills: on('skills') && data.skills.some((c) => c.skills.length > 0),
    projects: on('projects') && data.projects.length > 0,
    experience: on('experience') && data.experiences.length > 0,
    certificates: on('certificates') && data.certificates.length > 0,
    education: on('education') && data.education.length > 0,
    contact: on('contact'),
  }
}
