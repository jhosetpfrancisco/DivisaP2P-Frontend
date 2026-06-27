import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/home/HomeView.vue'
import { authRoutes } from '@/features/auth/routes'
import { perfilRoutes } from '@/features/perfil/routes'
import { ofertasRoutes } from '@/features/ofertas/routes'
import { transaccionesRoutes } from '@/features/transacciones/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    ...authRoutes,
    ...perfilRoutes,
    ...ofertasRoutes,
    ...transaccionesRoutes,
    // Las rutas de cada feature se irán agregando aquí (notificaciones, etc.)
  ],
})

// Guard base: rutas con meta.requiresAuth exigen token. Cada feature lo usará.
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'home' }
  }
})

export default router
