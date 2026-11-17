export default function FormActions({ onCancel, busy }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel}
        className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </div>
  )
}
