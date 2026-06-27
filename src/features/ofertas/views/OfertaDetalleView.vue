<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppLayout from '@/shared/layout/AppLayout.vue'
import { BaseButton, BaseCard, BaseBadge } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { ofertasService, type OfertaDto } from '../services/ofertas.service'

const route = useRoute()
const auth = useAuthStore()
const id = Number(route.params.id)

const oferta = ref<OfertaDto | null>(null)
const matches = ref<OfertaDto[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    oferta.value = (await ofertasService.obtener(id)).data
    matches.value = (await ofertasService.matches(id)).data ?? []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout :rol="auth.rol ?? undefined">
    <div class="mx-auto max-w-3xl">
      <RouterLink to="/ofertas" class="mb-4 inline-block text-sm text-brand-600 hover:underline">
        ← Volver a ofertas
      </RouterLink>

      <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
      <p v-else-if="!oferta" class="text-sm text-foreground-soft">Oferta no encontrada.</p>

      <template v-else>
        <BaseCard :title="`Oferta #${oferta.id}`" class="mb-5">
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-2">
              <BaseBadge :variant="oferta.tipoOperacion === 'Venta' ? 'success' : 'warning'">
                {{ oferta.tipoOperacion }}
              </BaseBadge>
              <BaseBadge v-if="oferta.esVolumenEtu" variant="info">ETU</BaseBadge>
              <BaseBadge variant="neutral">{{ oferta.estado }}</BaseBadge>
            </div>
            <p><strong class="text-foreground">Usuario:</strong> {{ oferta.usuarioNombre }} (★ {{ oferta.usuarioCalificacion }})</p>
            <p><strong class="text-foreground">Par:</strong> {{ oferta.divisaOrigen }} → {{ oferta.divisaDestino }}</p>
            <p><strong class="text-foreground">Disponible:</strong> {{ oferta.montoDisponible }} {{ oferta.divisaOrigen }}</p>
            <p><strong class="text-foreground">Tipo de cambio:</strong> {{ oferta.tipoCambio }}</p>
          </div>

          <div class="mt-4">
            <RouterLink :to="`/transacciones/nueva?ofertaId=${oferta.id}`">
              <BaseButton variant="primary">Iniciar transacción</BaseButton>
            </RouterLink>
          </div>
        </BaseCard>

        <BaseCard title="Ofertas compatibles (matches)">
          <p v-if="!matches.length" class="text-sm text-foreground-soft">
            No hay ofertas compatibles por ahora.
          </p>
          <ul v-else class="flex flex-col gap-2">
            <li
              v-for="m in matches"
              :key="m.id"
              class="flex items-center justify-between rounded-base border border-border px-3 py-2 text-sm"
            >
              <span>
                {{ m.usuarioNombre }} (★ {{ m.usuarioCalificacion }}) ·
                {{ m.divisaOrigen }} → {{ m.divisaDestino }} ·
                {{ m.montoDisponible }} · T.C. {{ m.tipoCambio }}
              </span>
              <RouterLink :to="`/ofertas/${m.id}`">
                <BaseButton variant="ghost">Ver</BaseButton>
              </RouterLink>
            </li>
          </ul>
        </BaseCard>
      </template>
    </div>
  </AppLayout>
</template>
