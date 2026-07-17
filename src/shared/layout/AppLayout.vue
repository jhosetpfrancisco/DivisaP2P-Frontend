<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useNotificacionesStore } from '@/features/notificaciones/stores/notificaciones.store'

const auth = useAuthStore()
const notificaciones = useNotificacionesStore()
const router = useRouter()

/** El menú lateral identifica el rol activo (lineamiento de diseño 5.2). */
const ETIQUETAS_ROL: Record<string, string> = {
  USU: 'Usuario',
  ETU: 'Empresa de turismo',
  ADM: 'Administrador',
}

const etiquetaRol = computed(() => (auth.rol ? (ETIQUETAS_ROL[auth.rol] ?? auth.rol) : ''))

// El administrador opera sobre el panel; el resto sobre ofertas y transacciones.
const nav = computed(() =>
  auth.esAdmin
    ? [
        { label: 'Dashboard', to: '/app/admin/dashboard' },
        { label: 'Usuarios', to: '/app/admin/usuarios' },
        { label: 'Disputas', to: '/app/admin/disputas' },
      ]
    : [
        { label: 'Ofertas', to: '/app/ofertas' },
        { label: 'Transacciones', to: '/app/transacciones' },
      ],
)

function cerrarSesion() {
  auth.logout()
  notificaciones.limpiar()
  router.push('/login')
}

onMounted(notificaciones.refrescar)
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="flex w-60 flex-col border-r border-border bg-surface px-4 py-6">
      <div class="mb-8 px-2">
        <span class="text-lg font-bold text-brand-600">DivisaP2P</span>
        <p class="mt-1 truncate text-xs text-foreground-soft">{{ auth.nombre ?? 'Usuario' }}</p>
        <span
          v-if="etiquetaRol"
          class="mt-1.5 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-medium text-brand-700"
        >
          {{ etiquetaRol }}
        </span>
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

        <!-- Campana: bandeja de notificaciones con contador de no leídas (US-021). -->
        <RouterLink
          to="/app/notificaciones"
          class="flex items-center gap-2 rounded-base px-3 py-2 text-sm font-medium text-foreground-soft transition hover:bg-surface-muted hover:text-foreground"
          active-class="bg-brand-50 text-brand-700"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M10 2a5 5 0 00-5 5v2.6l-1.3 2.6A1 1 0 004.6 14h10.8a1 1 0 00.9-1.4L15 9.6V7a5 5 0 00-5-5zM8 16a2 2 0 104 0H8z"
            />
          </svg>
          Notificaciones
          <span
            v-if="notificaciones.noLeidas"
            class="ml-auto inline-flex min-w-[1.25rem] justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white"
          >
            {{ notificaciones.noLeidas > 99 ? '99+' : notificaciones.noLeidas }}
          </span>
        </RouterLink>

        <RouterLink
          to="/app/perfil"
          class="rounded-base px-3 py-2 text-sm font-medium text-foreground-soft transition hover:bg-surface-muted hover:text-foreground"
          active-class="bg-brand-50 text-brand-700"
        >
          Perfil
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
