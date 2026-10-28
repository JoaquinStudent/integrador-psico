import { useEffect } from 'react'

/** Aviso en pantalla que reemplaza a `alert()`: no bloquea la página ni el teclado. */
export function Toast({ message, onClose, tone = 'error' }: {
  message: string | null
  onClose: () => void
  tone?: 'error' | 'info'
}) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className={`toast toast-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Cerrar aviso">×</button>
    </div>
  )
}
