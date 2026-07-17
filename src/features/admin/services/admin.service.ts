import http from '@/shared/api/http'
import type { Paginado } from '@/shared/api/pagination'
import type { TransaccionDto } from '@/features/transacciones/services/transacciones.service'

export interface UsuarioAdminDto {
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
  celular: string | null
  estado: string
  correoVerificado: boolean
  calificacionPromedio: number
  operacionesCompletadas: number
  fechaRegistro: string
}

export interface UsuarioFiltro {
  rol?: string
  estado?: string
  calificacionMin?: number
  pagina?: number
  tamanioPagina?: number
}

export interface ReporteTransaccionesFiltro {
  desde?: string
  hasta?: string
  estado?: string
  pagina?: number
  tamanioPagina?: number
}

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

  /** US-017 — Listado de usuarios con filtros (paginado). */
  usuarios(filtro: UsuarioFiltro) {
    return http.get<Paginado<UsuarioAdminDto>>('/admin/usuarios', { params: filtro })
  },

  /** US-017 — Bloquear una cuenta con motivo (mínimo 30 caracteres). */
  bloquear(id: number, motivo: string) {
    return http.post<{ mensaje: string }>(`/admin/usuarios/${id}/bloquear`, { motivo })
  },

  /** US-017 — Desbloquear una cuenta previamente bloqueada. */
  desbloquear(id: number) {
    return http.post<{ mensaje: string }>(`/admin/usuarios/${id}/desbloquear`)
  },

  /** US-019 — Aprobar una empresa de turismo pendiente de aprobación. */
  aprobarEmpresa(id: number) {
    return http.post<{ mensaje: string }>(`/admin/empresas/${id}/aprobar`)
  },

  /** US-018 — Reporte de transacciones por periodo (en pantalla, paginado). */
  reporteTransacciones(filtro: ReporteTransaccionesFiltro) {
    return http.get<Paginado<TransaccionDto>>('/admin/reportes/transacciones', { params: filtro })
  },

  /** US-018 — Exportar el reporte de transacciones filtrado a CSV (descarga). */
  exportarTransacciones(filtro: Omit<ReporteTransaccionesFiltro, 'pagina' | 'tamanioPagina'>) {
    return http.get('/admin/reportes/transacciones/export', {
      params: filtro,
      responseType: 'blob',
    })
  },
}
