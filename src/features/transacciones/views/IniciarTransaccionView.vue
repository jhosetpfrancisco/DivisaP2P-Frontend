<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AppLayout from '@/shared/layout/AppLayout.vue'
import { BaseButton, BaseInput, BaseCard, BaseBadge } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { ofertasService, type OfertaDto } from '@/features/ofertas/services/ofertas.service'
import { transaccionesService } from '../services/transacciones.service'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ofertaId = Number(route.query.ofertaId)

const oferta = ref<OfertaDto | null>(null)
const monto = ref<number>(0)
const error = ref('')
const loading = ref(false)

function validar(): boolean {
  error.value = ''
  if (!oferta.value) return false
  if (monto.value < 100) {
    error.value = 'El monto mínimo es 100'
    return false
  }
  if (monto.value > oferta.value.montoDisponible) {
    error.value = `El monto no puede superar lo disponible (${oferta.value.montoDisponible})`
    return false
  }
  return true
}

async function confirmar() {
  if (!validar()) return
  loading.value = true
  try {
    const { data } = await transaccionesService.iniciar(ofertaId, monto.value)
    if (data && data.id) router.push(`/transacciones/${data.id}`)
    else router.push('/transacciones')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    error.value = err.response?.data?.mensaje ?? 'No se pudo iniciar la transacción'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  oferta.value = (await ofertasService.obtener(ofertaId)).data
  monto.value = oferta.value.montoDisponible
})
</script>

<template>
  <AppLayout :rol="auth.rol ?? undefined">
    <div class="mx-auto max-w-lg">
      <h1 class="mb-6 text-2xl font-bold text-foreground">Iniciar transacción</h1>

      <BaseCard v-if="oferta">
        <div class="mb-4 flex flex-col gap-1 text-sm">
          <div class="flex items-center gap-2">
            <BaseBadge :variant="oferta.tipoOperacion === 'Venta' ? 'success' : 'warning'">
              {{ oferta.tipoOperacion }}
            </BaseBadge>
            <span class="text-foreground-soft">de {{ oferta.usuarioNombre }}</span>
          </div>
          <p><strong class="text-foreground">Par:</strong> {{ oferta.divisaOrigen }} → {{ oferta.divisaDestino }}</p>
          <p><strong class="text-foreground">Disponible:</strong> {{ oferta.montoDisponible }} {{ oferta.divisaOrigen }}</p>
          <p><strong class="text-foreground">Tipo de cambio:</strong> {{ oferta.tipoCambio }}</p>
        </div>

        <BaseInput
          v-model.number="monto"
          :label="`Monto a operar (${oferta.divisaOrigen})`"
          type="number"
          :error="error"
        />

        <div class="mt-4 flex gap-2">
          <BaseButton variant="primary" :disabled="loading" @click="confirmar">
            {{ loading ? 'Procesando…' : 'Confirmar transacción' }}
          </BaseButton>
          <RouterLink :to="`/ofertas/${ofertaId}`">
            <BaseButton variant="ghost">Cancelar</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>
