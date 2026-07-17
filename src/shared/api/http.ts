import axios from 'axios'

/**
 * Cliente HTTP único para consumir la API DivisaP2P (.NET 10).
 * - baseURL configurable por VITE_API_URL (default: backend local en :5180).
 * - Interceptor que adjunta el JWT (Authorization: Bearer) si existe.
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5180/api',
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Manejo global de la respuesta:
 * - 401 (token ausente/expirado/inválido): se limpia la sesión y se redirige al login.
 * - 403 (autenticado pero sin permiso de negocio): NO cierra sesión — el backend usa 403
 *   para reglas de negocio (login fallido, acción no permitida), y expulsar sería incorrecto.
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('nombre')
      localStorage.removeItem('usuarioId')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default http
