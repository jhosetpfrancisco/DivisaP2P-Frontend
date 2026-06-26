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

export default http
