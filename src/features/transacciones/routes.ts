import type { RouteRecordRaw } from 'vue-router'

export const transaccionesRoutes: RouteRecordRaw[] = [
  {
    path: '/transacciones',
    name: 'transacciones',
    component: () => import('./views/TransaccionesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/transacciones/nueva',
    name: 'transacciones-nueva',
    component: () => import('./views/IniciarTransaccionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/transacciones/:id',
    name: 'transacciones-detalle',
    component: () => import('./views/TransaccionDetalleView.vue'),
    meta: { requiresAuth: true },
  },
]
