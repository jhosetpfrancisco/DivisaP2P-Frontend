import type { RouteRecordRaw } from 'vue-router'

export const transaccionesRoutes: RouteRecordRaw[] = [
  {
    path: '/transacciones/nueva',
    name: 'transacciones-nueva',
    component: () => import('./views/IniciarTransaccionView.vue'),
    meta: { requiresAuth: true },
  },
]
