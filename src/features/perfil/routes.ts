import type { RouteRecordRaw } from 'vue-router'

// Ruta hija de /app (path relativo, sin barra inicial).
export const perfilRoutes: RouteRecordRaw[] = [
  {
    path: 'perfil',
    name: 'perfil',
    component: () => import('./views/PerfilView.vue'),
  },
]
