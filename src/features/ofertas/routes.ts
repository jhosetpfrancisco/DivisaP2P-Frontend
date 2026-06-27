import type { RouteRecordRaw } from 'vue-router'

export const ofertasRoutes: RouteRecordRaw[] = [
  {
    path: '/ofertas',
    name: 'ofertas',
    component: () => import('./views/OfertasView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ofertas/nueva',
    name: 'ofertas-nueva',
    component: () => import('./views/PublicarOfertaView.vue'),
    meta: { requiresAuth: true },
  },
]
