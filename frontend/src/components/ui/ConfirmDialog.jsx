export default function ConfirmDialog({ title, message, confirmText = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4">
      <div role="alertdialog" aria-modal="true" aria-label={title} className="card w-full max-w-sm">
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
            onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmText}</button>
        </div>
      </div>
    </div>
  )
}
