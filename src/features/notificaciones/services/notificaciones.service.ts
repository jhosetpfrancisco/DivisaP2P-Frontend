import http from '@/shared/api/http'

export interface NotificacionDto {
  id: number
  titulo: string
  descripcion: string
  enlace: string | null
  leida: boolean
  fecha: string
}

/** US-021 — Notificaciones del usuario. */
export const notificacionesService = {
  listar() {
    return http.get<NotificacionDto[]>('/notificaciones')
  },
  noLeidas() {
    return http.get<{ cantidad: number }>('/notificaciones/no-leidas')
  },
  marcarLeida(id: number) {
    return http.put<{ mensaje: string }>(`/notificaciones/${id}/leer`)
  },
  marcarTodas() {
    return http.put<{ mensaje: string }>('/notificaciones/leer-todas')
  },
}
