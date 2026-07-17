import http from '@/shared/api/http'
import type { Paginado } from '@/shared/api/pagination'

export interface TransaccionDto {
  id: number
  codigo: string
  ofertaId: number
  compradorId: number
  compradorNombre: string
  vendedorId: number
  vendedorNombre: string
  divisaOrigen: string
  divisaDestino: string
  montoOperado: number
  tipoCambio: number
  estado: string
  fechaInicio: string
  fechaLimiteAccion: string | null
}

export interface HistorialEstadoDto {
  estado: string
  comentario: string | null
  fecha: string
}

export interface VoucherDto {
  id: number
  tipo: string
  nombreArchivo: string
  rutaArchivo: string
  numeroOperacion: string
  fechaDeposito: string
  fechaSubida: string
}

export interface TransaccionDetalleDto extends TransaccionDto {
  historial: HistorialEstadoDto[]
  vouchers: VoucherDto[]
}

export interface TransaccionFiltro {
  desde?: string
  hasta?: string
  estado?: string
  pagina?: number
  tamanioPagina?: number
}

export interface ReporteDepositoPayload {
  numeroOperacion: string
  fechaDeposito: string
  nombreArchivo: string
  rutaArchivo: string
}

export interface ValidacionDepositoPayload {
  aprobar: boolean
  motivoRechazo?: string
}

/** Servicio de transacciones — consume los endpoints /api/transacciones del backend. */
export const transaccionesService = {
  /** US-008 — Iniciar una transacción a partir de una oferta. */
  iniciar(ofertaId: number, monto: number) {
    return http.post<TransaccionDetalleDto>('/transacciones', { ofertaId, monto })
  },

  /** US-011 — Detalle de una transacción (incluye historial y vouchers). */
  obtener(id: number) {
    return http.get<TransaccionDetalleDto>(`/transacciones/${id}`)
  },

  /**
   * US-009 — Reportar un depósito (pago o entrega) y adjuntar el voucher.
   * El backend decide si es voucher de Pago o de Entrega según el estado actual
   * y quién ejecuta la acción.
   */
  reportar(id: number, payload: ReporteDepositoPayload) {
    return http.post<{ mensaje: string }>(`/transacciones/${id}/reportar`, payload)
  },

  /**
   * US-010 — Validar el depósito reportado por la contraparte.
   * Al aprobar avanza el flujo; al rechazar la transacción pasa a disputa
   * y exige un motivo de al menos 20 caracteres.
   */
  validar(id: number, payload: ValidacionDepositoPayload) {
    return http.post<{ mensaje: string }>(`/transacciones/${id}/validar`, payload)
  },

  /** US-013 — Historial de transacciones del usuario (paginado). */
  historial(filtro: TransaccionFiltro) {
    return http.get<Paginado<TransaccionDto>>('/transacciones', { params: filtro })
  },
}
