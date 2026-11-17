export default function Pagination({ page, limit, total, onChange }) {
  const pages = Math.max(Math.ceil(total / limit), 1)
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-slate-500">Page {page} of {pages} · {total} total</span>
      <div className="flex gap-2">
        <button className="btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
        <button className="btn" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
