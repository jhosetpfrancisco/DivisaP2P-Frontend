import http from '@/shared/api/http'

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

/** Servicio de transacciones — consume los endpoints /api/transacciones del backend. */
export const transaccionesService = {
  /** US-008 — Iniciar una transacción a partir de una oferta. */
  iniciar(ofertaId: number, monto: number) {
    return http.post<TransaccionDetalleDto>('/transacciones', { ofertaId, monto })
  },
}
