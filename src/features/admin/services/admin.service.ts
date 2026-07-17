import http from '@/shared/api/http'

export interface VolumenPorDivisaDto {
  divisa: string
  volumen: number
}

export interface EvolucionDiariaDto {
  fecha: string
  cantidad: number
}

export interface TopUsuarioDto {
  usuarioId: number
  nombre: string
  volumenOperado: number
}

export interface DashboardDto {
  usuariosRegistrados: number
  ofertasActivas: number
  transaccionesHoy: number
  transaccionesEnDisputa: number
  volumenPorDivisa: VolumenPorDivisaDto[]
  evolucionDiaria: EvolucionDiariaDto[]
  topUsuarios: TopUsuarioDto[]
  disputasPendientes: number
}

/** Servicio del panel administrativo — consume los endpoints /api/admin (rol ADM). */
export const adminService = {
  /** US-016 — Métricas del panel de control. */
  dashboard() {
    return http.get<DashboardDto>('/admin/dashboard')
  },
}
