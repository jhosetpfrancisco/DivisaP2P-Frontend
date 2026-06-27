<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseSelect, BaseInput, BaseCard, BaseBadge } from '@/components/ui'
import { ofertasService, type OfertaDto } from '../services/ofertas.service'

const filtros = reactive({
  tipoOperacion: '',
  divisa: '',
  montoMin: '',
  montoMax: '',
  calificacionMin: '',
  ordenarPor: '',
})

const ofertas = ref<OfertaDto[]>([])
const total = ref(0)
const pagina = ref(1)
const tamanioPagina = 10
const totalPaginas = ref(1)
const loading = ref(false)

const tipoOperacionOpts = [
  { label: 'Todas', value: '' },
  { label: 'Compra', value: 'Compra' },
  { label: 'Venta', value: 'Venta' },
]
const divisaOpts = [
  { label: 'Todas', value: '' },
  { label: 'PEN', value: 'PEN' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]
const ordenOpts = [
  { label: 'Más recientes', value: '' },
  { label: 'Mejor tipo de cambio', value: 'tipoCambio' },
  { label: 'Mayor calificación', value: 'calificacion' },
]

function num(v: string): number | undefined {
  return v.trim() === '' ? undefined : Number(v)
}

async function buscar() {
  loading.value = true
  try {
    const { data } = await ofertasService.buscar({
      tipoOperacion: filtros.tipoOperacion || undefined,
      divisa: filtros.divisa || undefined,
      montoMin: num(filtros.montoMin),
      montoMax: num(filtros.montoMax),
      calificacionMin: num(filtros.calificacionMin),
      ordenarPor: filtros.ordenarPor || undefined,
      pagina: pagina.value,
      tamanioPagina,
    })
    ofertas.value = data.data
    total.value = data.total
    totalPaginas.value = data.totalPaginas
  } finally {
    loading.value = false
  }
}

function aplicarFiltros() {
  pagina.value = 1
  buscar()
}

function irPagina(p: number) {
  if (p < 1 || p > totalPaginas.value) return
  pagina.value = p
  buscar()
}

onMounted(buscar)
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Ofertas</h1>
      <div class="flex gap-2">
        <RouterLink to="/app/ofertas/mias"><BaseButton variant="secondary">Mis ofertas</BaseButton></RouterLink>
        <RouterLink to="/app/ofertas/nueva"><BaseButton variant="primary">Publicar oferta</BaseButton></RouterLink>
      </div>
    </div>

    <BaseCard class="mb-5">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-6">
        <BaseSelect v-model="filtros.tipoOperacion" label="Operación" :options="tipoOperacionOpts" />
        <BaseSelect v-model="filtros.divisa" label="Divisa" :options="divisaOpts" />
        <BaseInput v-model="filtros.montoMin" label="Monto mín." type="number" />
        <BaseInput v-model="filtros.montoMax" label="Monto máx." type="number" />
        <BaseInput v-model="filtros.calificacionMin" label="Calif. mín." type="number" />
        <BaseSelect v-model="filtros.ordenarPor" label="Ordenar por" :options="ordenOpts" />
      </div>
      <div class="mt-3">
        <BaseButton variant="primary" @click="aplicarFiltros">Aplicar filtros</BaseButton>
      </div>
    </BaseCard>

    <BaseCard>
      <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
      <p v-else-if="!ofertas.length" class="text-sm text-foreground-soft">No hay ofertas que coincidan.</p>

      <table v-else class="w-full text-left text-sm">
        <thead class="border-b border-border text-xs uppercase text-foreground-soft">
          <tr>
            <th class="py-2">Usuario</th>
            <th>Operación</th>
            <th>Par</th>
            <th>Disponible</th>
            <th>T. cambio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in ofertas" :key="o.id" class="border-b border-border/60">
            <td class="py-3">
              {{ o.usuarioNombre }}
              <span class="text-foreground-soft">★ {{ o.usuarioCalificacion }}</span>
              <BaseBadge v-if="o.esVolumenEtu" variant="info">ETU</BaseBadge>
            </td>
            <td>
              <BaseBadge :variant="o.tipoOperacion === 'Venta' ? 'success' : 'warning'">
                {{ o.tipoOperacion }}
              </BaseBadge>
            </td>
            <td>{{ o.divisaOrigen }} → {{ o.divisaDestino }}</td>
            <td>{{ o.montoDisponible }} {{ o.divisaOrigen }}</td>
            <td>{{ o.tipoCambio }}</td>
            <td class="text-right">
              <RouterLink :to="`/app/ofertas/${o.id}`">
                <BaseButton variant="ghost">Ver</BaseButton>
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="ofertas.length" class="mt-4 flex items-center justify-between text-sm text-foreground-soft">
        <span>{{ total }} ofertas · página {{ pagina }} de {{ totalPaginas }}</span>
        <div class="flex gap-2">
          <BaseButton variant="secondary" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">Anterior</BaseButton>
          <BaseButton variant="secondary" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
