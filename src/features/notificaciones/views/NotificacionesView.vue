<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/shared/layout/AppLayout.vue'
import { BaseButton, BaseCard } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { formatFecha } from '@/shared/utils/format'
import { notificacionesService, type NotificacionDto } from '../services/notificaciones.service'

const auth = useAuthStore()
const notificaciones = ref<NotificacionDto[]>([])
const loading = ref(false)

const noLeidas = computed(() => notificaciones.value.filter((n) => !n.leida).length)

async function cargar() {
  loading.value = true
  try {
    notificaciones.value = (await notificacionesService.listar()).data
  } finally {
    loading.value = false
  }
}

async function marcar(n: NotificacionDto) {
  if (n.leida) return
  await notificacionesService.marcarLeida(n.id)
  n.leida = true
}

async function marcarTodas() {
  await notificacionesService.marcarTodas()
  notificaciones.value.forEach((n) => (n.leida = true))
}

onMounted(cargar)
</script>

<template>
  <AppLayout :rol="auth.rol ?? undefined">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-foreground">
          Notificaciones
          <span v-if="noLeidas" class="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-sm text-white">
            {{ noLeidas }}
          </span>
        </h1>
        <BaseButton v-if="noLeidas" variant="secondary" @click="marcarTodas">
          Marcar todas como leídas
        </BaseButton>
      </div>

      <BaseCard>
        <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
        <p v-else-if="!notificaciones.length" class="text-sm text-foreground-soft">
          No tienes notificaciones.
        </p>

        <ul v-else class="flex flex-col gap-2">
          <li
            v-for="n in notificaciones"
            :key="n.id"
            class="cursor-pointer rounded-base border px-4 py-3 transition"
            :class="n.leida ? 'border-border bg-surface' : 'border-brand-200 bg-brand-50'"
            @click="marcar(n)"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-foreground">
                <span v-if="!n.leida" class="mr-1 inline-block h-2 w-2 rounded-full bg-brand-600"></span>
                {{ n.titulo }}
              </span>
              <span class="text-xs text-foreground-soft">{{ formatFecha(n.fecha) }}</span>
            </div>
            <p class="mt-1 text-sm text-foreground-soft">{{ n.descripcion }}</p>
          </li>
        </ul>
      </BaseCard>
    </div>
  </AppLayout>
</template>
