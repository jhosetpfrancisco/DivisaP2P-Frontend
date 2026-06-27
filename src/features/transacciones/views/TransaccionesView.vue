<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/shared/layout/AppLayout.vue'
import { BaseButton, BaseSelect, BaseInput, BaseCard, BaseBadge } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { formatFecha, estadoTransaccionVariant } from '@/shared/utils/format'
import { transaccionesService, type TransaccionDto } from '../services/transacciones.service'

const auth = useAuthStore()

const filtros = reactive({ desde: '', hasta: '', estado: '' })
const items = ref<TransaccionDto[]>([])
const total = ref(0)
const pagina = ref(1)
const tamanioPagina = 20
const totalPaginas = ref(1)
const loading = ref(false)

const estadoOpts = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente de pago', value: 'PendientePago' },
  { label: 'Pago reportado', value: 'PagoReportado' },
  { label: 'Pago confirmado', value: 'PagoConfirmado' },
  { label: 'Entrega reportada', value: 'EntregaReportada' },
  { label: 'Completada', value: 'Completada' },
  { label: 'Cancelada', value: 'Cancelada' },
  { label: 'En disputa', value: 'EnDisputa' },
]

async function cargar() {
  loading.value = true
  try {
    const { data } = await transaccionesService.historial({
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined,
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
  <AppLayout :rol="auth.rol ?? undefined">
    <div class="mx-auto max-w-5xl">
      <h1 class="mb-6 text-2xl font-bold text-foreground">Historial de transacciones</h1>

      <BaseCard class="mb-5">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <BaseInput v-model="filtros.desde" label="Desde" type="date" />
          <BaseInput v-model="filtros.hasta" label="Hasta" type="date" />
          <BaseSelect v-model="filtros.estado" label="Estado" :options="estadoOpts" />
          <div class="flex items-end">
            <BaseButton variant="primary" @click="aplicar">Filtrar</BaseButton>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
        <p v-else-if="!items.length" class="text-sm text-foreground-soft">No tienes transacciones.</p>

        <table v-else class="w-full text-left text-sm">
          <thead class="border-b border-border text-xs uppercase text-foreground-soft">
            <tr>
              <th class="py-2">Código</th>
              <th>Contraparte</th>
              <th>Par</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id" class="border-b border-border/60">
              <td class="py-3 font-medium text-foreground">{{ t.codigo }}</td>
              <td>{{ t.compradorNombre }} / {{ t.vendedorNombre }}</td>
              <td>{{ t.divisaOrigen }} → {{ t.divisaDestino }}</td>
              <td>{{ t.montoOperado }} {{ t.divisaOrigen }}</td>
              <td><BaseBadge :variant="estadoTransaccionVariant(t.estado)">{{ t.estado }}</BaseBadge></td>
              <td>{{ formatFecha(t.fechaInicio) }}</td>
              <td class="text-right">
                <RouterLink :to="`/transacciones/${t.id}`"><BaseButton variant="ghost">Ver</BaseButton></RouterLink>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="items.length" class="mt-4 flex items-center justify-between text-sm text-foreground-soft">
          <span>{{ total }} transacciones · página {{ pagina }} de {{ totalPaginas }}</span>
          <div class="flex gap-2">
            <BaseButton variant="secondary" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">Anterior</BaseButton>
            <BaseButton variant="secondary" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>
