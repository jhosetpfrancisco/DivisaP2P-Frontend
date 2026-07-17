import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/shared/layout/AppLayout.vue'
import { authRoutes } from '@/features/auth/routes'
import { ofertasRoutes } from '@/features/ofertas/routes'
import { transaccionesRoutes } from '@/features/transacciones/routes'
import { perfilRoutes } from '@/features/perfil/routes'
import { notificacionesRoutes } from '@/features/notificaciones/routes'
import { adminRoutes } from '@/features/admin/routes'

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
        // /app sin sub-ruta → el admin va a su panel; el resto a ofertas.
        {
          path: '',
          redirect: () =>
            localStorage.getItem('rol') === 'ADM' ? '/app/admin/dashboard' : '/app/ofertas',
        },
        ...ofertasRoutes,
        ...transaccionesRoutes,
        ...perfilRoutes,
        ...notificacionesRoutes,
        ...adminRoutes,
      ],
    },

    // Cualquier otra ruta → a la raíz (que resuelve según sesión).
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Rutas públicas donde no tiene sentido estar con la sesión iniciada.
const RUTAS_INVITADO = ['/login', '/registro', '/registro-empresa']

router.beforeEach((to) => {
  const isAuth = !!localStorage.getItem('token')
  const rol = localStorage.getItem('rol')

  // Ruta protegida sin sesión → login.
  if (to.meta.requiresAuth && !isAuth) {
    return { path: '/login' }
  }

  // Con sesión, no tiene sentido ver login/registro → a la app.
  if (isAuth && RUTAS_INVITADO.includes(to.path)) {
    return { path: '/app' }
  }

  // Ruta restringida por rol (ej: el panel administrativo es solo para ADM).
  const roles = to.meta.roles as string[] | undefined
  if (roles && (!rol || !roles.includes(rol))) {
    return { path: '/app' }
  }
})

export default router
