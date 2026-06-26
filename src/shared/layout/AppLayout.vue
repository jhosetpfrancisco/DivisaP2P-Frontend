<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  /** Rol activo a mostrar en la barra lateral (USU / ETU / ADM). */
  rol?: string
}>()

const nav = [
  { label: 'Ofertas', to: '/ofertas' },
  { label: 'Transacciones', to: '/transacciones' },
  { label: 'Notificaciones', to: '/notificaciones' },
  { label: 'Perfil', to: '/perfil' },
]
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="flex w-60 flex-col border-r border-border bg-surface px-4 py-6">
      <div class="mb-8 px-2">
        <span class="text-lg font-bold text-brand-600">DivisaP2P</span>
        <p class="mt-1 text-xs text-foreground-soft">Rol: {{ rol ?? 'Invitado' }}</p>
      </div>
      <nav class="flex flex-col gap-1">
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
    </aside>

    <main class="flex-1 px-8 py-6">
      <slot />
    </main>
  </div>
</template>
