import type { RouteRecordRaw } from 'vue-router'

// Rutas hijas de /app restringidas al administrador (meta.roles lo valida el router).
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: 'admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { roles: ['ADM'] },
  },
]
