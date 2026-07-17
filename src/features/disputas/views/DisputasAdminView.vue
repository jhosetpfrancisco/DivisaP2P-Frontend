<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseSelect, BaseCard, BaseBadge } from '@/components/ui'
import { formatFecha, estadoDisputaVariant, etiquetaResolucion } from '@/shared/utils/format'
import { disputasService, type DisputaDto } from '../services/disputas.service'

const filtros = reactive({ estado: '' })
const items = ref<DisputaDto[]>([])
const total = ref(0)
const pagina = ref(1)
const tamanioPagina = 10
const totalPaginas = ref(1)
const loading = ref(false)

const estadoOpts = [
  { label: 'Todas', value: '' },
  { label: 'Abiertas', value: 'Abierta' },
  { label: 'Resueltas', value: 'Resuelta' },
]

async function cargar() {
  loading.value = true
  try {
    const { data } = await disputasService.listar({
      estado: filtros.estado || undefined,
      pagina: pagina.value,
      tamanioPagina,
    })
    items.value = data.data
    total.value = data.total
    totalPaginas.value = data.totalPaginas
  } finally {
    loading.value = false
  }
}

function aplicar() {
  pagina.value = 1
  cargar()
}

function irPagina(p: number) {
  if (p < 1 || p > totalPaginas.value) return
  pagina.value = p
  cargar()
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <h1 class="mb-6 text-2xl font-bold text-foreground">Bandeja de disputas</h1>

    <BaseCard class="mb-5">
      <div class="flex items-end gap-3">
        <div class="w-56">
          <BaseSelect v-model="filtros.estado" label="Estado" :options="estadoOpts" />
        </div>
        <BaseButton variant="primary" @click="aplicar">Filtrar</BaseButton>
      </div>
    </BaseCard>

    <BaseCard>
      <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
      <p v-else-if="!items.length" class="text-sm text-foreground-soft">No hay disputas que coincidan.</p>

      <table v-else class="w-full text-left text-sm">
        <thead class="border-b border-border text-xs uppercase text-foreground-soft">
          <tr>
            <th class="py-2">Transacción</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Resolución</th>
            <th>Apertura</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in items" :key="d.id" class="border-b border-border/60">
            <td class="py-3 font-medium text-foreground">{{ d.transaccionCodigo }}</td>
            <td class="max-w-xs truncate text-foreground-soft">{{ d.motivo }}</td>
            <td><BaseBadge :variant="estadoDisputaVariant(d.estado)">{{ d.estado }}</BaseBadge></td>
            <td class="text-foreground-soft">{{ d.resolucion ? etiquetaResolucion(d.resolucion) : '—' }}</td>
            <td class="text-foreground-soft">{{ formatFecha(d.fechaApertura) }}</td>
            <td class="text-right">
              <RouterLink :to="`/app/admin/disputas/${d.id}`">
                <BaseButton variant="ghost">{{ d.estado === 'Abierta' ? 'Resolver' : 'Ver' }}</BaseButton>
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="items.length" class="mt-4 flex items-center justify-between text-sm text-foreground-soft">
        <span>{{ total }} disputas · página {{ pagina }} de {{ totalPaginas }}</span>
        <div class="flex gap-2">
          <BaseButton variant="secondary" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">Anterior</BaseButton>
          <BaseButton variant="secondary" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
