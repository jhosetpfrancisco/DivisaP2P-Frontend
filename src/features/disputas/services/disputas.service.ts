import http from '@/shared/api/http'
import type { Paginado } from '@/shared/api/pagination'

export interface DisputaDto {
  id: number
  transaccionId: number
  transaccionCodigo: string
  abiertaPorId: number
  motivo: string
  estado: string
  resolucion: string | null
  comentarioResolucion: string | null
  fechaApertura: string
  fechaResolucion: string | null
  evidencias: string[]
}

export interface DisputaCreatePayload {
  transaccionId: number
  motivo: string
  evidencias: string[]
}

export interface DisputaFiltro {
  estado?: string
  pagina?: number
  tamanioPagina?: number
}

export interface ResolucionDisputaPayload {
  resolucion: 'AFavorComprador' | 'AFavorVendedor' | 'Anulada'
  comentario: string
}

/** Servicio de disputas — apertura (usuarios) y resolución (administrador). */
export const disputasService = {
  /** US-014 — Apertura de disputa por una de las partes de la transacción. */
  crear(payload: DisputaCreatePayload) {
    return http.post<DisputaDto>('/disputas', payload)
  },

  /** US-015 — Bandeja de disputas para el administrador (paginada). */
  listar(filtro: DisputaFiltro) {
    return http.get<Paginado<DisputaDto>>('/disputas', { params: filtro })
  },

  /** US-015 — Detalle de una disputa (administrador). */
  obtener(id: number) {
    return http.get<DisputaDto>(`/disputas/${id}`)
  },

  /** US-015 — Resolver una disputa con un comentario justificativo (mínimo 50 caracteres). */
  resolver(id: number, payload: ResolucionDisputaPayload) {
    return http.post<{ mensaje: string }>(`/disputas/${id}/resolver`, payload)
  },
}
