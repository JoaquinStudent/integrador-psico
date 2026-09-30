import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // `host: true` hace que Vite escuche en la red local, no solo en loopback. Sin
    // esto la tablet del paciente no puede abrir la aplicacion: el enlace que le da
    // el examinador apunta a un host que la tablet no alcanza.
    // Vite imprime la direccion de red al arrancar ("Network: http://192.168.x.x:5173"),
    // y esa es la que hay que usar en el laptop tambien, para que el enlace que arma
    // la pantalla de monitoreo desde `window.location.origin` sirva en la tablet.
    host: true,
  },
})
