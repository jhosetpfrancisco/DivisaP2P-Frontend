<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseSelect, BaseInput, BaseCard, BaseBadge } from '@/components/ui'
import {
  formatFecha,
  formatMonto,
  etiquetaEstado,
  estadoTransaccionVariant,
} from '@/shared/utils/format'
import { descargarBlob, nombreDesdeContentDisposition } from '@/shared/utils/descarga'
import { adminService } from '../services/admin.service'
import type { TransaccionDto } from '@/features/transacciones/services/transacciones.service'

const filtros = reactive({ desde: '', hasta: '', estado: '' })
const items = ref<TransaccionDto[]>([])
const total = ref(0)
const pagina = ref(1)
const tamanioPagina = 20
const totalPaginas = ref(1)
const loading = ref(false)
const exportando = ref(false)

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

// Suma del monto operado en la página visible (los totales globales no los expone la API).
const montoPagina = computed(() => items.value.reduce((acc, t) => acc + t.montoOperado, 0))

function filtroActual() {
  return {
    desde: filtros.desde || undefined,
    hasta: filtros.hasta || undefined,
    estado: filtros.estado || undefined,
  }
}

async function cargar() {
  loading.value = true
  try {
    const { data } = await adminService.reporteTransacciones({
      ...filtroActual(),
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

async function exportar() {
  exportando.value = true
  try {
    const respuesta = await adminService.exportarTransacciones(filtroActual())
    const nombre = nombreDesdeContentDisposition(
      respuesta.headers['content-disposition'],
      'reporte_transacciones.csv',
    )
    descargarBlob(respuesta.data as Blob, nombre)
  } finally {
    exportando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <h1 class="mb-6 text-2xl font-bold text-foreground">Reporte de transacciones</h1>

    <BaseCard class="mb-5">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BaseInput v-model="filtros.desde" label="Desde" type="date" />
        <BaseInput v-model="filtros.hasta" label="Hasta" type="date" />
        <BaseSelect v-model="filtros.estado" label="Estado" :options="estadoOpts" />
        <div class="flex items-end gap-2">
          <BaseButton variant="primary" @click="aplicar">Filtrar</BaseButton>
          <BaseButton variant="secondary" :disabled="exportando" @click="exportar">
            {{ exportando ? 'Exportando…' : 'Exportar CSV' }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
      <p v-else-if="!items.length" class="text-sm text-foreground-soft">
        No hay transacciones para los filtros seleccionados.
      </p>

      <template v-else>
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border text-xs uppercase text-foreground-soft">
            <tr>
              <th class="py-2">Código</th>
              <th>Comprador</th>
              <th>Vendedor</th>
              <th>Par</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Inicio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id" class="border-b border-border/60">
              <td class="py-3 font-medium text-foreground">{{ t.codigo }}</td>
              <td>{{ t.compradorNombre }}</td>
              <td>{{ t.vendedorNombre }}</td>
              <td>{{ t.divisaOrigen }} → {{ t.divisaDestino }}</td>
              <td>{{ formatMonto(t.montoOperado, t.divisaOrigen) }}</td>
              <td>
                <BaseBadge :variant="estadoTransaccionVariant(t.estado)">{{ etiquetaEstado(t.estado) }}</BaseBadge>
              </td>
              <td class="text-foreground-soft">{{ formatFecha(t.fechaInicio) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-border text-sm font-medium text-foreground">
              <td class="py-2" colspan="4">Total de la página</td>
              <td>{{ formatMonto(montoPagina) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div class="mt-4 flex items-center justify-between text-sm text-foreground-soft">
          <span>{{ total }} transacciones · página {{ pagina }} de {{ totalPaginas }}</span>
          <div class="flex gap-2">
            <BaseButton variant="secondary" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">Anterior</BaseButton>
            <BaseButton variant="secondary" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente</BaseButton>
          </div>
        </div>
      </template>
    </BaseCard>

    <p class="mt-4 text-xs text-foreground-soft">
      La exportación descarga el reporte de transacciones filtrado en formato CSV (compatible con Excel).
      <RouterLink to="/app/admin/dashboard" class="text-brand-600 hover:underline">Ir al dashboard</RouterLink>
    </p>
  </div>
</template>
