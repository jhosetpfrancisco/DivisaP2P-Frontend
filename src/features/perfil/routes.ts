import type { RouteRecordRaw } from 'vue-router'

export const perfilRoutes: RouteRecordRaw[] = [
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('./views/PerfilView.vue'),
    meta: { requiresAuth: true },
  },
]
