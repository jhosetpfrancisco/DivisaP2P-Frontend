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

export interface LoginPayload {
  correo: string
  password: string
}

export interface AuthResponse {
  token: string
  expiraEn: string
  usuarioId: number
  rol: string
  nombreMostrado: string
  correo: string
}

/** Servicio de autenticación — consume los endpoints /api/auth del backend. */
export const authService = {
  /** US-001 — Registro de usuario (persona natural). */
  registrar(payload: RegistroUsuarioPayload) {
    return http.post<{ mensaje: string }>('/auth/registro', payload)
  },

  /** US-002 — Inicio de sesión (devuelve el JWT). */
  login(payload: LoginPayload) {
    return http.post<AuthResponse>('/auth/login', payload)
  },
}
