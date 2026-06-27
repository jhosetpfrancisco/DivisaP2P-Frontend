import type { RouteRecordRaw } from 'vue-router'

// Rutas hijas de /app (paths relativos, sin barra inicial).
export const ofertasRoutes: RouteRecordRaw[] = [
  {
    path: 'ofertas',
    name: 'ofertas',
    component: () => import('./views/OfertasView.vue'),
  },
  {
    path: 'ofertas/nueva',
    name: 'ofertas-nueva',
    component: () => import('./views/PublicarOfertaView.vue'),
  },
  {
    path: 'ofertas/mias',
    name: 'ofertas-mias',
    component: () => import('./views/MisOfertasView.vue'),
  },
  {
    path: 'ofertas/:id',
    name: 'ofertas-detalle',
    component: () => import('./views/OfertaDetalleView.vue'),
  },
]
