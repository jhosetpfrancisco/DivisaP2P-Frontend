import type { RouteRecordRaw } from 'vue-router'

export const notificacionesRoutes: RouteRecordRaw[] = [
  {
    path: '/notificaciones',
    name: 'notificaciones',
    component: () => import('./views/NotificacionesView.vue'),
    meta: { requiresAuth: true },
  },
]
