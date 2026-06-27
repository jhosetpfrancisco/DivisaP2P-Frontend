<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseInput, BaseSelect, BaseCard } from '@/components/ui'
import { perfilService, type CuentaBancariaDto } from '@/features/perfil/services/perfil.service'
import { ofertasService, type OfertaCreatePayload } from '../services/ofertas.service'

const router = useRouter()

const cuentas = ref<CuentaBancariaDto[]>([])

const form = reactive<OfertaCreatePayload>({
  tipoOperacion: 'Venta',
  divisaOrigen: 'USD',
  divisaDestino: 'PEN',
  monto: 100,
  tipoCambio: 1,
  cuentaBancariaId: 0,
})

const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

const tipoOperacion = [
  { label: 'Venta', value: 'Venta' },
  { label: 'Compra', value: 'Compra' },
]
const divisas = [
  { label: 'PEN', value: 'PEN' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]

const cuentaOptions = computed(() =>
  cuentas.value.map((c) => ({
    label: `${c.banco} · ${c.divisa} · ${c.numeroCuenta}`,
    value: c.id,
  })),
)

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (form.divisaOrigen === form.divisaDestino)
    errors.divisas = 'La divisa origen y destino deben ser distintas'
  if (form.monto < 100 || form.monto > 500000)
    errors.monto = 'El monto debe estar entre 100 y 500 000'
  if (form.tipoCambio <= 0) errors.tipoCambio = 'El tipo de cambio debe ser mayor a 0'
  if (!form.cuentaBancariaId) errors.cuenta = 'Selecciona una cuenta bancaria'
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await ofertasService.crear({ ...form })
    router.push('/app/ofertas/mias')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo publicar la oferta'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  cuentas.value = (await perfilService.listarCuentas()).data
  if (cuentas.value.length) form.cuentaBancariaId = cuentas.value[0].id
})
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h1 class="mb-6 text-2xl font-bold text-foreground">Publicar oferta</h1>

    <BaseCard>
      <p v-if="!cuentas.length" class="mb-4 text-sm text-warning">
        Necesitas registrar al menos una cuenta bancaria en tu perfil para publicar ofertas.
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="form.tipoOperacion" label="Tipo de operación" :options="tipoOperacion" />
          <BaseInput v-model.number="form.tipoCambio" label="Tipo de cambio" type="number" :error="errors.tipoCambio" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="form.divisaOrigen" label="Divisa origen" :options="divisas" />
          <BaseSelect v-model="form.divisaDestino" label="Divisa destino" :options="divisas" />
        </div>
        <p v-if="errors.divisas" class="-mt-2 text-xs text-danger">{{ errors.divisas }}</p>

        <BaseInput v-model.number="form.monto" label="Monto" type="number" :error="errors.monto" />

        <BaseSelect
          v-model="form.cuentaBancariaId"
          label="Cuenta bancaria"
          :options="cuentaOptions"
          placeholder="Selecciona…"
          :error="errors.cuenta"
        />

        <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>

        <BaseButton type="submit" variant="primary" block :disabled="loading || !cuentas.length">
          {{ loading ? 'Publicando…' : 'Publicar oferta' }}
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
