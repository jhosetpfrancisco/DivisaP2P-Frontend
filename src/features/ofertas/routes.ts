import type { RouteRecordRaw } from 'vue-router'

export const ofertasRoutes: RouteRecordRaw[] = [
  {
    path: '/ofertas/nueva',
    name: 'ofertas-nueva',
    component: () => import('./views/PublicarOfertaView.vue'),
    meta: { requiresAuth: true },
  },
]
