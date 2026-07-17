<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseCard, BaseButton } from '@/components/ui'
import { formatFecha, formatMonto } from '@/shared/utils/format'
import { adminService, type DashboardDto } from '../services/admin.service'

const data = ref<DashboardDto | null>(null)
const loading = ref(false)

const kpis = computed(() =>
  data.value
    ? [
        { label: 'Usuarios registrados', valor: data.value.usuariosRegistrados },
        { label: 'Ofertas activas', valor: data.value.ofertasActivas },
        { label: 'Transacciones hoy', valor: data.value.transaccionesHoy },
        { label: 'Transacciones en disputa', valor: data.value.transaccionesEnDisputa },
      ]
    : [],
)

// Altura relativa de cada barra del gráfico de evolución (0–100 %).
const maxEvolucion = computed(() =>
  Math.max(1, ...(data.value?.evolucionDiaria ?? []).map((d) => d.cantidad)),
)

async function cargar() {
  loading.value = true
  try {
    data.value = (await adminService.dashboard()).data
  } finally {
    loading.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Panel administrativo</h1>
      <BaseButton variant="secondary" :disabled="loading" @click="cargar">
        {{ loading ? 'Actualizando…' : 'Actualizar' }}
      </BaseButton>
    </div>

    <p v-if="!data && loading" class="text-sm text-foreground-soft">Cargando métricas…</p>

    <template v-else-if="data">
      <!-- KPIs principales. -->
      <div class="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <BaseCard v-for="kpi in kpis" :key="kpi.label">
          <p class="text-sm text-foreground-soft">{{ kpi.label }}</p>
          <p class="mt-1 text-2xl font-bold text-foreground">{{ kpi.valor }}</p>
        </BaseCard>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <!-- Volumen operado por divisa. -->
        <BaseCard title="Volumen operado por divisa">
          <ul v-if="data.volumenPorDivisa.length" class="flex flex-col gap-2 text-sm">
            <li
              v-for="v in data.volumenPorDivisa"
              :key="v.divisa"
              class="flex items-center justify-between border-b border-border/60 pb-1"
            >
              <span class="font-medium text-foreground">{{ v.divisa }}</span>
              <span class="text-foreground-soft">{{ formatMonto(v.volumen) }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-foreground-soft">Sin operaciones registradas.</p>
        </BaseCard>

        <!-- Acceso rápido a disputas pendientes. -->
        <BaseCard title="Disputas pendientes">
          <p class="text-3xl font-bold text-foreground">{{ data.disputasPendientes }}</p>
          <p class="mb-3 text-sm text-foreground-soft">disputas esperando resolución</p>
          <RouterLink to="/app/admin/disputas">
            <BaseButton variant="primary">Ir a la bandeja de disputas</BaseButton>
          </RouterLink>
        </BaseCard>
      </div>

      <!-- Evolución diaria de transacciones (últimos 30 días). -->
      <BaseCard title="Evolución de transacciones (últimos 30 días)" class="mt-5">
        <div v-if="data.evolucionDiaria.length" class="flex h-40 items-end gap-1">
          <div
            v-for="d in data.evolucionDiaria"
            :key="d.fecha"
            class="flex-1 rounded-t bg-brand-500/80 transition hover:bg-brand-600"
            :style="{ height: `${(d.cantidad / maxEvolucion) * 100}%` }"
            :title="`${formatFecha(d.fecha).slice(0, 10)}: ${d.cantidad}`"
          ></div>
        </div>
        <p v-else class="text-sm text-foreground-soft">Sin datos en el periodo.</p>
      </BaseCard>

      <!-- Top 10 usuarios por volumen del mes. -->
      <BaseCard title="Top 10 usuarios por volumen (mes)" class="mt-5">
        <table v-if="data.topUsuarios.length" class="w-full text-left text-sm">
          <thead class="border-b border-border text-xs uppercase text-foreground-soft">
            <tr>
              <th class="py-2">#</th>
              <th>Usuario</th>
              <th class="text-right">Volumen operado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in data.topUsuarios" :key="u.usuarioId" class="border-b border-border/60">
              <td class="py-2 text-foreground-soft">{{ i + 1 }}</td>
              <td class="font-medium text-foreground">{{ u.nombre }}</td>
              <td class="text-right">{{ formatMonto(u.volumenOperado) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-sm text-foreground-soft">Aún no hay operaciones este mes.</p>
      </BaseCard>
    </template>
  </div>
</template>
