<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseInput, BaseSelect, BaseCard } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { formatMonto } from '@/shared/utils/format'
import { perfilService, type CuentaBancariaDto } from '@/features/perfil/services/perfil.service'
import {
  ofertasService,
  type OfertaCreatePayload,
  type OfertaEscalon,
} from '../services/ofertas.service'

const router = useRouter()
const auth = useAuthStore()

// US-020 — Las empresas de turismo operan hasta 500 000; los usuarios regulares hasta 50 000.
const montoMaximo = computed(() => (auth.esEmpresa ? 500_000 : 50_000))

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

// US-020 — Tramos escalonados (solo ETU, hasta 3).
const escalones = ref<OfertaEscalon[]>([])

function agregarEscalon() {
  if (escalones.value.length >= 3) return
  escalones.value.push({ montoDesde: 100, montoHasta: form.monto, tipoCambio: form.tipoCambio })
}

function quitarEscalon(i: number) {
  escalones.value.splice(i, 1)
}

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
  if (!Number.isFinite(form.monto) || form.monto < 100 || form.monto > montoMaximo.value)
    errors.monto = `El monto debe estar entre 100 y ${formatMonto(montoMaximo.value)}`
  if (form.tipoCambio <= 0) errors.tipoCambio = 'El tipo de cambio debe ser mayor a 0'
  if (!form.cuentaBancariaId) errors.cuenta = 'Selecciona una cuenta bancaria'

  // Validación de los tramos escalonados (US-020).
  if (auth.esEmpresa && escalones.value.length) {
    for (const [i, e] of escalones.value.entries()) {
      if (e.montoDesde < 100 || e.montoHasta <= e.montoDesde || e.montoHasta > form.monto || e.tipoCambio <= 0) {
        errors.escalones = `Revisa el tramo ${i + 1}: el rango debe estar entre 100 y el monto total, y el tipo de cambio ser mayor a 0`
        break
      }
    }
  }

  return Object.keys(errors).length === 0
}

async function onSubmit() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await ofertasService.crear({
      ...form,
      escalones: auth.esEmpresa && escalones.value.length ? escalones.value : undefined,
    })
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
      <p
        v-if="auth.esEmpresa"
        class="mb-4 rounded-base bg-brand-50 px-3 py-2 text-sm text-brand-700"
      >
        Como empresa de turismo puedes publicar ofertas de hasta
        {{ formatMonto(montoMaximo) }} y se distinguen con la etiqueta ETU en el listado.
      </p>
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

        <BaseInput
          v-model.number="form.monto"
          :label="`Monto (100 – ${formatMonto(montoMaximo)})`"
          type="number"
          :error="errors.monto"
        />

        <BaseSelect
          v-model="form.cuentaBancariaId"
          label="Cuenta bancaria"
          :options="cuentaOptions"
          placeholder="Selecciona…"
          :error="errors.cuenta"
        />

        <!-- US-020 — Tramos escalonados (solo ETU, hasta 3). -->
        <div v-if="auth.esEmpresa" class="rounded-base border border-border p-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-foreground">Tramos escalonados (opcional)</span>
            <BaseButton
              type="button"
              variant="secondary"
              :disabled="escalones.length >= 3"
              @click="agregarEscalon"
            >
              Agregar tramo
            </BaseButton>
          </div>
          <p class="mb-3 text-xs text-foreground-soft">
            Aplica un tipo de cambio distinto según el rango de monto operado. Para montos fuera de
            todos los tramos se usa el tipo de cambio base.
          </p>

          <div
            v-for="(e, i) in escalones"
            :key="i"
            class="mb-2 grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2"
          >
            <BaseInput v-model.number="e.montoDesde" label="Desde" type="number" />
            <BaseInput v-model.number="e.montoHasta" label="Hasta" type="number" />
            <BaseInput v-model.number="e.tipoCambio" label="T. cambio" type="number" />
            <BaseButton type="button" variant="ghost" @click="quitarEscalon(i)">Quitar</BaseButton>
          </div>

          <p v-if="errors.escalones" class="text-xs text-danger">{{ errors.escalones }}</p>
        </div>

        <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>

        <BaseButton type="submit" variant="primary" block :disabled="loading || !cuentas.length">
          {{ loading ? 'Publicando…' : 'Publicar oferta' }}
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
