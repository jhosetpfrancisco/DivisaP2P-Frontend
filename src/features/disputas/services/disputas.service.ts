import http from '@/shared/api/http'

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

/** US-014 — Apertura de disputa por una de las partes de la transacción. */
export const disputasService = {
  crear(payload: DisputaCreatePayload) {
    return http.post<DisputaDto>('/disputas', payload)
  },
}
