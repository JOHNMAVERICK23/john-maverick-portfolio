export const fmtMonth = (d) =>
  d
    ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : ''

export const PROJECT_STATUS = { planned: 'Planned', in_progress: 'In progress', completed: 'Completed' }
