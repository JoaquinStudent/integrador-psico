import { useRef, useState } from 'react'

interface Props {
  sessionId: string
}

/**
 * El enlace que se abre en la tablet del paciente.
 *
 * Se muestra mientras la tablet no esté conectada y desaparece sola cuando lo está.
 *
 * Dos detalles que parecen cosméticos y no lo son:
 *
 *  - **El aviso de localhost.** Si el examinador abrió la app en `localhost`, el
 *    enlace apunta a la tablet misma y no funciona. Vale más decirlo que entregar
 *    una URL que falla en la demo.
 *  - **La ruta corta.** En `http://<ip-lan>:5173` el navegador no está en contexto
 *    seguro, así que `navigator.clipboard` no existe y copiar puede fallar. Aparte,
 *    nadie teclea un UUID en una tablet. Por eso se ofrece `/sesion/activa`, que la
 *    tablet puede guardar en favoritos una vez y reusar en cada sesión.
 */
export function TabletLinkCard({ sessionId }: Props) {
  const [copiado, setCopiado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const origen = window.location.origin
  const enlace = `${origen}/sesion/${sessionId}/paciente/bienvenida`
  const atajo = `${origen}/sesion/activa`
  const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  const copiar = async () => {
    inputRef.current?.select()
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      // Sin contexto seguro no hay API de portapapeles. El texto queda
      // seleccionado, que es lo único que se puede ofrecer sin mentir.
      setCopiado(false)
    }
  }

  return (
    <div className="tablet-link-card">
      <h3 className="session-panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>
        Abre la sesión en la tablet
      </h3>

      {esLocal && (
        <p className="tablet-link-warning">
          Estás en <code>{window.location.hostname}</code>: este enlace solo funciona en
          esta computadora. Para usar la tablet, abre la app por la dirección de red que
          imprime Vite (<code>http://192.168.x.x:5173</code>) y vuelve a entrar aquí.
        </p>
      )}

      <label className="tablet-link-label" htmlFor="enlace-tablet">Enlace de esta sesión</label>
      <div className="tablet-link-row">
        <input
          id="enlace-tablet"
          ref={inputRef}
          className="tablet-link-input"
          readOnly
          value={enlace}
          onClick={e => e.currentTarget.select()}
        />
        <button className="tablet-link-copy" onClick={copiar}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <p className="tablet-link-hint">
        O guarda <strong>{atajo}</strong> en los favoritos de la tablet: abre siempre la
        sesión que tengas lista, sin teclear el código.
      </p>
      <p className="tablet-link-hint">
        La tablet debe estar iniciada con tu cuenta. Se hace una sola vez.
      </p>

      <div className="tablet-link-waiting">
        <span className="status-dot" />
        Esperando que la tablet se conecte...
      </div>
    </div>
  )
}
