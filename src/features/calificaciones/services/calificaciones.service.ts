import http from '@/shared/api/http'

export interface CalificacionDto {
  id: number
  transaccionId: number
  calificadorId: number
  calificadoId: number
  estrellas: number
  comentario: string | null
  fecha: string
}

export interface CalificacionCreatePayload {
  transaccionId: number
  estrellas: number
  comentario?: string
}

/** US-012 — Calificación de la contraparte tras una transacción completada. */
export const calificacionesService = {
  crear(payload: CalificacionCreatePayload) {
    return http.post<CalificacionDto>('/calificaciones', payload)
  },
}
