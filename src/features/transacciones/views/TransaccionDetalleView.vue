<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { BaseCard, BaseBadge, BaseButton } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import {
  formatFecha,
  formatMonto,
  etiquetaEstado,
  estadoTransaccionVariant,
  tiempoRestante,
  plazoVencido,
} from '@/shared/utils/format'
import ReporteDepositoModal from '../components/ReporteDepositoModal.vue'
import { transaccionesService, type TransaccionDetalleDto } from '../services/transacciones.service'

const route = useRoute()
const auth = useAuthStore()
const id = Number(route.params.id)

const tx = ref<TransaccionDetalleDto | null>(null)
const loading = ref(true)

// Reloj para el conteo del plazo restante (US-011): se refresca cada 20 s.
const ahora = ref(Date.now())
let reloj: ReturnType<typeof setInterval> | undefined

// Lado del usuario en la transacción: define qué acciones puede ejecutar.
const soyComprador = computed(() => !!tx.value && tx.value.compradorId === auth.usuarioId)
const soyVendedor = computed(() => !!tx.value && tx.value.vendedorId === auth.usuarioId)

// El plazo solo se muestra mientras la transacción espera una acción con fecha límite.
const mostrarPlazo = computed(
  () => !!tx.value?.fechaLimiteAccion && !['Completada', 'Cancelada'].includes(tx.value.estado),
)

// US-009 — Reporte de depósito.
const reporteModal = ref(false)
const tipoReporte = computed<'Pago' | 'Entrega'>(() =>
  tx.value?.estado === 'PagoConfirmado' ? 'Entrega' : 'Pago',
)
const puedeReportar = computed(() => {
  if (!tx.value) return false
  if (tx.value.estado === 'PendientePago') return soyComprador.value
  if (tx.value.estado === 'PagoConfirmado') return soyVendedor.value
  return false
})

async function cargar() {
  loading.value = true
  try {
    tx.value = (await transaccionesService.obtener(id)).data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargar()
  reloj = setInterval(() => (ahora.value = Date.now()), 20_000)
})

onBeforeUnmount(() => clearInterval(reloj))
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
          <BaseBadge :variant="estadoTransaccionVariant(tx.estado)">{{ etiquetaEstado(tx.estado) }}</BaseBadge>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <p><strong class="text-foreground">Comprador:</strong> {{ tx.compradorNombre }}</p>
          <p><strong class="text-foreground">Vendedor:</strong> {{ tx.vendedorNombre }}</p>
          <p><strong class="text-foreground">Par:</strong> {{ tx.divisaOrigen }} → {{ tx.divisaDestino }}</p>
          <p><strong class="text-foreground">Monto:</strong> {{ formatMonto(tx.montoOperado, tx.divisaOrigen) }}</p>
          <p><strong class="text-foreground">Tipo de cambio:</strong> {{ tx.tipoCambio }}</p>
          <p><strong class="text-foreground">Inicio:</strong> {{ formatFecha(tx.fechaInicio) }}</p>
        </div>

        <!-- Plazo restante para la siguiente acción esperada (US-011). -->
        <p
          v-if="mostrarPlazo"
          class="mt-3 rounded-base px-3 py-2 text-sm"
          :class="
            plazoVencido(tx.fechaLimiteAccion, ahora)
              ? 'bg-red-50 text-danger'
              : 'bg-surface-muted text-foreground-soft'
          "
        >
          <strong class="text-foreground">Plazo para la siguiente acción:</strong>
          {{ tiempoRestante(tx.fechaLimiteAccion, ahora) }}
        </p>
      </BaseCard>

      <!-- Acciones disponibles según el estado y el rol del usuario. -->
      <BaseCard v-if="puedeReportar" title="Acciones" class="mb-5">
        <BaseButton variant="primary" @click="reporteModal = true">
          {{ tipoReporte === 'Pago' ? 'Reportar pago' : 'Reportar entrega' }}
        </BaseButton>
      </BaseCard>

      <BaseCard title="Línea de tiempo" class="mb-5">
        <ol class="relative flex flex-col gap-4 border-l border-border pl-5">
          <li v-for="(h, i) in tx.historial" :key="i" class="relative">
            <span class="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-500"></span>
            <div class="flex items-center gap-2">
              <BaseBadge :variant="estadoTransaccionVariant(h.estado)">{{ etiquetaEstado(h.estado) }}</BaseBadge>
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

      <ReporteDepositoModal
        v-model="reporteModal"
        :transaccion-id="tx.id"
        :codigo="tx.codigo"
        :tipo="tipoReporte"
        @reportado="cargar"
      />
    </template>
  </div>
</template>
