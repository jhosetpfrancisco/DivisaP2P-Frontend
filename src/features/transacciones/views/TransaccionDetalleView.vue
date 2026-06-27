<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { BaseCard, BaseBadge } from '@/components/ui'
import { formatFecha, estadoTransaccionVariant } from '@/shared/utils/format'
import { transaccionesService, type TransaccionDetalleDto } from '../services/transacciones.service'

const route = useRoute()
const id = Number(route.params.id)

const tx = ref<TransaccionDetalleDto | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    tx.value = (await transaccionesService.obtener(id)).data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink to="/app/transacciones" class="mb-4 inline-block text-sm text-brand-600 hover:underline">
      ← Volver al historial
    </RouterLink>

    <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
    <p v-else-if="!tx" class="text-sm text-foreground-soft">Transacción no encontrada.</p>

    <template v-else>
      <BaseCard :title="tx.codigo" class="mb-5">
        <div class="mb-3">
          <BaseBadge :variant="estadoTransaccionVariant(tx.estado)">{{ tx.estado }}</BaseBadge>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <p><strong class="text-foreground">Comprador:</strong> {{ tx.compradorNombre }}</p>
          <p><strong class="text-foreground">Vendedor:</strong> {{ tx.vendedorNombre }}</p>
          <p><strong class="text-foreground">Par:</strong> {{ tx.divisaOrigen }} → {{ tx.divisaDestino }}</p>
          <p><strong class="text-foreground">Monto:</strong> {{ tx.montoOperado }} {{ tx.divisaOrigen }}</p>
          <p><strong class="text-foreground">Tipo de cambio:</strong> {{ tx.tipoCambio }}</p>
          <p><strong class="text-foreground">Inicio:</strong> {{ formatFecha(tx.fechaInicio) }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Línea de tiempo" class="mb-5">
        <ol class="relative flex flex-col gap-4 border-l border-border pl-5">
          <li v-for="(h, i) in tx.historial" :key="i" class="relative">
            <span class="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-500"></span>
            <div class="flex items-center gap-2">
              <BaseBadge :variant="estadoTransaccionVariant(h.estado)">{{ h.estado }}</BaseBadge>
              <span class="text-xs text-foreground-soft">{{ formatFecha(h.fecha) }}</span>
            </div>
            <p v-if="h.comentario" class="mt-1 text-sm text-foreground-soft">{{ h.comentario }}</p>
          </li>
        </ol>
      </BaseCard>

      <BaseCard title="Comprobantes">
        <p v-if="!tx.vouchers.length" class="text-sm text-foreground-soft">Sin comprobantes.</p>
        <ul v-else class="flex flex-col gap-2 text-sm">
          <li
            v-for="v in tx.vouchers"
            :key="v.id"
            class="flex items-center justify-between rounded-base border border-border px-3 py-2"
          >
            <span>
              <BaseBadge variant="neutral">{{ v.tipo }}</BaseBadge>
              {{ v.nombreArchivo }} · Op. {{ v.numeroOperacion }}
            </span>
            <span class="text-foreground-soft">{{ formatFecha(v.fechaDeposito) }}</span>
          </li>
        </ul>
      </BaseCard>
    </template>
  </div>
</template>
