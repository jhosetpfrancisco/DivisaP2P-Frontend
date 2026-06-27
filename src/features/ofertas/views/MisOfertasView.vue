<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseInput, BaseCard, BaseBadge } from '@/components/ui'
import { ofertasService, type OfertaDto } from '../services/ofertas.service'

const ofertas = ref<OfertaDto[]>([])
const loading = ref(false)
const mensaje = ref('')

// tipo de cambio en edición por oferta (id -> valor)
const edicion = reactive<Record<number, number>>({})

function estadoVariant(estado: string) {
  if (estado === 'Activa') return 'success'
  if (estado === 'Cancelada') return 'danger'
  return 'neutral'
}

async function cargar() {
  loading.value = true
  try {
    ofertas.value = (await ofertasService.listarMias()).data
    ofertas.value.forEach((o) => (edicion[o.id] = o.tipoCambio))
  } finally {
    loading.value = false
  }
}

async function guardar(id: number) {
  mensaje.value = ''
  try {
    await ofertasService.actualizar(id, edicion[id])
    mensaje.value = 'Tipo de cambio actualizado'
    await cargar()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    mensaje.value = err.response?.data?.mensaje ?? 'No se pudo actualizar'
  }
}

async function cancelar(id: number) {
  mensaje.value = ''
  try {
    await ofertasService.cancelar(id)
    await cargar()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    mensaje.value = err.response?.data?.mensaje ?? 'No se pudo cancelar'
  }
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Mis ofertas</h1>
      <RouterLink to="/app/ofertas/nueva"><BaseButton variant="primary">Publicar oferta</BaseButton></RouterLink>
    </div>

    <p v-if="mensaje" class="mb-3 text-sm text-info">{{ mensaje }}</p>

    <BaseCard>
      <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
      <p v-else-if="!ofertas.length" class="text-sm text-foreground-soft">Aún no has publicado ofertas.</p>

      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="o in ofertas"
          :key="o.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-base border border-border px-4 py-3 text-sm"
        >
          <div>
            <BaseBadge :variant="estadoVariant(o.estado)">{{ o.estado }}</BaseBadge>
            <span class="ml-2 font-medium text-foreground">{{ o.tipoOperacion }}</span>
            {{ o.divisaOrigen }} → {{ o.divisaDestino }} ·
            {{ o.montoDisponible }}/{{ o.montoTotal }} {{ o.divisaOrigen }}
          </div>

          <div v-if="o.estado === 'Activa'" class="flex items-center gap-2">
            <div class="w-32">
              <BaseInput v-model.number="edicion[o.id]" type="number" />
            </div>
            <BaseButton variant="secondary" @click="guardar(o.id)">Guardar T.C.</BaseButton>
            <BaseButton variant="danger" @click="cancelar(o.id)">Cancelar</BaseButton>
          </div>
          <span v-else class="text-foreground-soft">T.C. {{ o.tipoCambio }}</span>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
