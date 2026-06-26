import http from '@/shared/api/http'

export interface RegistroUsuarioPayload {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  correo: string
  password: string
  tipoDocumento: 'DNI' | 'CE'
  numeroDocumento: string
  celular: string
  aceptaTerminos: boolean
}

/** Servicio de autenticación — consume los endpoints /api/auth del backend. */
export const authService = {
  /** US-001 — Registro de usuario (persona natural). */
  registrar(payload: RegistroUsuarioPayload) {
    return http.post<{ mensaje: string }>('/auth/registro', payload)
  },
}
