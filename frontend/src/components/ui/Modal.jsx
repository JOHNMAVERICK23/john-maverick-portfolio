import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, wide = false, backdrop = true }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4"
      onMouseDown={(e) => backdrop && e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title}
        className={`card my-8 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
