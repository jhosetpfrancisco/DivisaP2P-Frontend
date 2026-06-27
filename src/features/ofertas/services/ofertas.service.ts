import http from '@/shared/api/http'
import type { Paginado } from '@/shared/api/pagination'

export interface OfertaDto {
  id: number
  usuarioId: number
  usuarioNombre: string
  usuarioCalificacion: number
  tipoOperacion: string
  divisaOrigen: string
  divisaDestino: string
  montoTotal: number
  montoDisponible: number
  tipoCambio: number
  estado: string
  esVolumenEtu: boolean
  fechaPublicacion: string
  fechaExpiracion: string
}

export interface OfertaCreatePayload {
  tipoOperacion: string
  divisaOrigen: string
  divisaDestino: string
  monto: number
  tipoCambio: number
  cuentaBancariaId: number
}

export interface OfertaFiltro {
  tipoOperacion?: string
  divisa?: string
  montoMin?: number
  montoMax?: number
  calificacionMin?: number
  ordenarPor?: string
  pagina?: number
  tamanioPagina?: number
}

/** Servicio de ofertas — consume los endpoints /api/ofertas del backend. */
export const ofertasService = {
  /** US-004 — Publicar una oferta de compra/venta. */
  crear(payload: OfertaCreatePayload) {
    return http.post<{ mensaje: string }>('/ofertas', payload)
  },

  /** US-005 — Buscar y filtrar ofertas activas (excluye las propias). */
  buscar(filtro: OfertaFiltro) {
    return http.get<Paginado<OfertaDto>>('/ofertas', { params: filtro })
  },

  /** US-006 — Listar las ofertas del usuario autenticado. */
  listarMias() {
    return http.get<OfertaDto[]>('/ofertas/mias')
  },

  /** US-006 — Editar el tipo de cambio de una oferta propia. */
  actualizar(id: number, tipoCambio: number) {
    return http.put<{ mensaje: string }>(`/ofertas/${id}`, { tipoCambio })
  },

  /** US-006 — Cancelar una oferta propia. */
  cancelar(id: number) {
    return http.delete<{ mensaje: string }>(`/ofertas/${id}`)
  },

  /** US-007 — Detalle de una oferta. */
  obtener(id: number) {
    return http.get<OfertaDto>(`/ofertas/${id}`)
  },

  /** US-007 — Ofertas compatibles (matching) para una oferta. */
  matches(id: number) {
    return http.get<OfertaDto[]>(`/ofertas/${id}/matches`)
  },
}
