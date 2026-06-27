import type { RouteRecordRaw } from 'vue-router'

// Ruta hija de /app (path relativo, sin barra inicial).
export const notificacionesRoutes: RouteRecordRaw[] = [
  {
    path: 'notificaciones',
    name: 'notificaciones',
    component: () => import('./views/NotificacionesView.vue'),
  },
]
