import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/home/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // Las rutas de cada feature se irán agregando aquí (auth, ofertas, etc.)
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
