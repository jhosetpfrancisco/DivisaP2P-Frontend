import type { RouteRecordRaw } from 'vue-router'

// Rutas hijas de /app para la gestión de disputas (solo administrador).
export const disputasRoutes: RouteRecordRaw[] = [
  {
    path: 'admin/disputas',
    name: 'admin-disputas',
    component: () => import('./views/DisputasAdminView.vue'),
    meta: { roles: ['ADM'] },
  },
  {
    path: 'admin/disputas/:id',
    name: 'admin-disputa-detalle',
    component: () => import('./views/DisputaResolucionView.vue'),
    meta: { roles: ['ADM'] },
  },
]
