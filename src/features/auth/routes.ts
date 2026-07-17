import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/registro',
    name: 'registro',
    component: () => import('./views/RegistroView.vue'),
  },
  {
    path: '/registro-empresa',
    name: 'registro-empresa',
    component: () => import('./views/RegistroEmpresaView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginView.vue'),
  },
]
