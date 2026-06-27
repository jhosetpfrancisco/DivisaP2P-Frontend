<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()

const nav = [
  { label: 'Ofertas', to: '/app/ofertas' },
  { label: 'Transacciones', to: '/app/transacciones' },
  { label: 'Notificaciones', to: '/app/notificaciones' },
  { label: 'Perfil', to: '/app/perfil' },
]

function cerrarSesion() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="flex w-60 flex-col border-r border-border bg-surface px-4 py-6">
      <div class="mb-8 px-2">
        <span class="text-lg font-bold text-brand-600">DivisaP2P</span>
        <p class="mt-1 text-xs text-foreground-soft">
          {{ auth.nombre ?? 'Usuario' }}<span v-if="auth.rol"> · {{ auth.rol }}</span>
        </p>
      </div>

      <nav class="flex flex-1 flex-col gap-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-base px-3 py-2 text-sm font-medium text-foreground-soft transition hover:bg-surface-muted hover:text-foreground"
          active-class="bg-brand-50 text-brand-700"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <button
        type="button"
        class="mt-4 rounded-base border border-border px-3 py-2 text-sm font-medium text-foreground-soft transition hover:bg-surface-muted hover:text-danger"
        @click="cerrarSesion"
      >
        Cerrar sesión
      </button>
    </aside>

    <main class="flex-1 px-8 py-6">
      <RouterView />
    </main>
  </div>
</template>
