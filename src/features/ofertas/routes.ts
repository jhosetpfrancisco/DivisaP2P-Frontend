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
  {
    path: '/ofertas/mias',
    name: 'ofertas-mias',
    component: () => import('./views/MisOfertasView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ofertas/:id',
    name: 'ofertas-detalle',
    component: () => import('./views/OfertaDetalleView.vue'),
    meta: { requiresAuth: true },
  },
]
