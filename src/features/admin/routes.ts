import type { RouteRecordRaw } from 'vue-router'

// Rutas hijas de /app restringidas al administrador (meta.roles lo valida el router).
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: 'admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { roles: ['ADM'] },
  },
  {
    path: 'admin/usuarios',
    name: 'admin-usuarios',
    component: () => import('./views/UsuariosView.vue'),
    meta: { roles: ['ADM'] },
  },
  {
    path: 'admin/reportes',
    name: 'admin-reportes',
    component: () => import('./views/ReportesView.vue'),
    meta: { roles: ['ADM'] },
  },
]
