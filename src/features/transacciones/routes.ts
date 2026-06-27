import type { RouteRecordRaw } from 'vue-router'

// Rutas hijas de /app (paths relativos, sin barra inicial).
export const transaccionesRoutes: RouteRecordRaw[] = [
  {
    path: 'transacciones',
    name: 'transacciones',
    component: () => import('./views/TransaccionesView.vue'),
  },
  {
    path: 'transacciones/nueva',
    name: 'transacciones-nueva',
    component: () => import('./views/IniciarTransaccionView.vue'),
  },
  {
    path: 'transacciones/:id',
    name: 'transacciones-detalle',
    component: () => import('./views/TransaccionDetalleView.vue'),
  },
]
