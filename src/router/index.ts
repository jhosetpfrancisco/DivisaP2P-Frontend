import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/shared/layout/AppLayout.vue'
import { authRoutes } from '@/features/auth/routes'
import { ofertasRoutes } from '@/features/ofertas/routes'
import { transaccionesRoutes } from '@/features/transacciones/routes'
import { perfilRoutes } from '@/features/perfil/routes'
import { notificacionesRoutes } from '@/features/notificaciones/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Raíz: según haya sesión (JWT en localStorage) va a la app o al login.
    {
      path: '/',
      redirect: () => (localStorage.getItem('token') ? '/app' : '/login'),
    },

    // Rutas públicas (login / registro).
    ...authRoutes,

    // Área autenticada: todo cuelga de /app y comparte el layout.
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        // /app sin sub-ruta → ofertas por defecto.
        { path: '', redirect: '/app/ofertas' },
        ...ofertasRoutes,
        ...transaccionesRoutes,
        ...perfilRoutes,
        ...notificacionesRoutes,
      ],
    },

    // Cualquier otra ruta → a la raíz (que resuelve según sesión).
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const isAuth = !!localStorage.getItem('token')

  // Ruta protegida sin sesión → login.
  if (to.meta.requiresAuth && !isAuth) {
    return { path: '/login' }
  }

  // Con sesión, no tiene sentido ver login/registro → a la app.
  if (isAuth && (to.path === '/login' || to.path === '/registro')) {
    return { path: '/app' }
  }
})

export default router
