import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/registro',
    name: 'registro',
    component: () => import('./views/RegistroView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginView.vue'),
  },
]
