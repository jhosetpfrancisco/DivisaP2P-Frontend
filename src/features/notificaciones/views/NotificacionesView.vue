<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseCard } from '@/components/ui'
import { formatFecha } from '@/shared/utils/format'
import { useNotificacionesStore } from '../stores/notificaciones.store'
import { notificacionesService, type NotificacionDto } from '../services/notificaciones.service'

// Proposito: muestra el listado de notificaciones del usuario y permite marcarlas como leidas.
// Props: este componente de vista no recibe propiedades externas.
// Emits: este componente no emite eventos hacia componentes padre.
const router = useRouter()
const store = useNotificacionesStore()

// Estado local con las notificaciones cargadas desde el servicio.
const notificaciones = ref<NotificacionDto[]>([])
// Indica si la vista esta esperando la respuesta del listado.
const loading = ref(false)

// Cantidad derivada de notificaciones pendientes de lectura.
const noLeidas = computed(() => notificaciones.value.filter((n) => !n.leida).length)

// Carga las notificaciones iniciales y alinea el contador global de la campana.
async function cargar() {
  loading.value = true
  try {
    notificaciones.value = (await notificacionesService.listar()).data
    // Sincroniza el contador de la campana con lo que realmente llegó.
    store.noLeidas = noLeidas.value
  } finally {
    loading.value = false
  }
}

// Marca una notificacion individual como leida y actualiza el contador global.
async function marcar(n: NotificacionDto) {
  if (n.leida) return
  await notificacionesService.marcarLeida(n.id)
  n.leida = true
  store.descontar()
}

// Marca todas las notificaciones como leidas y limpia el contador global.
async function marcarTodas() {
  await notificacionesService.marcarTodas()
  notificaciones.value.forEach((n) => (n.leida = true))
  store.limpiar()
}

/** Cada notificación enlaza directo a la pantalla relacionada (US-021). */
// Abre la notificacion: primero asegura su lectura y luego navega si tiene enlace.
async function abrir(n: NotificacionDto) {
  await marcar(n)
  if (n.enlace) router.push(n.enlace)
}

// Lifecycle hook: carga las notificaciones cuando la vista se monta.
onMounted(cargar)
</script>

<template>
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
          @click="abrir(n)"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-foreground">
              <span v-if="!n.leida" class="mr-1 inline-block h-2 w-2 rounded-full bg-brand-600"></span>
              {{ n.titulo }}
            </span>
            <span class="text-xs text-foreground-soft">{{ formatFecha(n.fecha) }}</span>
          </div>
          <p class="mt-1 text-sm text-foreground-soft">{{ n.descripcion }}</p>
          <span v-if="n.enlace" class="mt-1 inline-block text-xs text-brand-600">Ver detalle →</span>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
