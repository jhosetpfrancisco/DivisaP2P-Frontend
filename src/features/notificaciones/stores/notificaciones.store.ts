import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificacionesService } from '../services/notificaciones.service'

/**
 * US-021 — Contador de notificaciones no leídas que alimenta la campana del menú.
 * Vive fuera de la vista de notificaciones porque el badge se muestra en todo el layout.
 */
export const useNotificacionesStore = defineStore('notificaciones', () => {
  const noLeidas = ref(0)

  async function refrescar() {
    try {
      noLeidas.value = (await notificacionesService.noLeidas()).data.cantidad
    } catch {
      // El contador es informativo: si falla, no vale la pena romper el layout.
      noLeidas.value = 0
    }
  }

  function descontar() {
    if (noLeidas.value > 0) noLeidas.value--
  }

  function limpiar() {
    noLeidas.value = 0
  }

  return { noLeidas, refrescar, descontar, limpiar }
})
