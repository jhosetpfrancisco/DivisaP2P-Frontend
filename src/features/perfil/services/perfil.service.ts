import http from '@/shared/api/http'

export interface PerfilDto {
  id: number
  rol: string
  nombres: string
  apellidoPaterno: string | null
  apellidoMaterno: string | null
  razonSocial: string | null
  ruc: string | null
  correo: string
  tipoDocumento: string | null
  numeroDocumento: string | null
  celular: string
  estado: string
  correoVerificado: boolean
  notificacionesCorreo: boolean
  calificacionPromedio: number
  operacionesCompletadas: number
  fechaRegistro: string
}

export interface PerfilUpdatePayload {
  nombres: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  celular: string
  notificacionesCorreo: boolean
}

export interface CambioPasswordPayload {
  passwordActual: string
  passwordNueva: string
}

export interface CuentaBancariaDto {
  id: number
  banco: string
  tipoCuenta: string
  divisa: string
  numeroCuenta: string
  cci: string
  nombreTitular: string
  esPredeterminada: boolean
}

export interface CuentaBancariaCreatePayload {
  banco: string
  tipoCuenta: string
  divisa: string
  numeroCuenta: string
  cci: string
  nombreTitular: string
  esPredeterminada: boolean
}

/** US-003 — Perfil del usuario y sus cuentas bancarias. */
export const perfilService = {
  obtener() {
    return http.get<PerfilDto>('/perfil')
  },
  actualizar(payload: PerfilUpdatePayload) {
    return http.put<{ mensaje: string }>('/perfil', payload)
  },
  cambiarPassword(payload: CambioPasswordPayload) {
    return http.put<{ mensaje: string }>('/perfil/password', payload)
  },
  listarCuentas() {
    return http.get<CuentaBancariaDto[]>('/perfil/cuentas')
  },
  crearCuenta(payload: CuentaBancariaCreatePayload) {
    return http.post<{ mensaje: string }>('/perfil/cuentas', payload)
  },
  eliminarCuenta(id: number) {
    return http.delete<{ mensaje: string }>(`/perfil/cuentas/${id}`)
  },
}
