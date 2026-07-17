<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { BaseModal, BaseTextarea, BaseBadge } from '@/components/ui'
import { formatFecha } from '@/shared/utils/format'
import { urlArchivo } from '@/shared/utils/archivo'
import { transaccionesService, type VoucherDto } from '../services/transacciones.service'

const props = defineProps<{
  transaccionId: number
  /** 'Pago' cuando el vendedor valida el pago, 'Entrega' cuando el comprador valida la entrega. */
  tipo: 'Pago' | 'Entrega'
  /** Voucher que la contraparte reportó y que aquí se revisa. */
  voucher: VoucherDto | null
}>()

const emit = defineEmits<{ validado: [] }>()
const open = defineModel<boolean>({ required: true })

const form = reactive({ aprobar: true, motivoRechazo: '' })
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

const titulo = computed(() => (props.tipo === 'Pago' ? 'Validar pago recibido' : 'Validar entrega recibida'))

// Al abrir se reinicia siempre en "confirmar" para no arrastrar un rechazo previo.
watch(open, (abierto) => {
  if (abierto) {
    form.aprobar = true
    form.motivoRechazo = ''
    serverError.value = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }
})

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  // Sin comprobante a la vista no se puede confirmar a ciegas; solo se habilita el rechazo.
  if (!props.voucher && form.aprobar) {
    errors.aprobar = 'No hay comprobante para revisar; solo puedes rechazar hasta que la contraparte lo reporte.'
  }
  if (!form.aprobar && form.motivoRechazo.trim().length < 20) {
    errors.motivoRechazo = 'El motivo del rechazo debe tener al menos 20 caracteres'
  }
  return Object.keys(errors).length === 0
}

async function confirmar() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await transaccionesService.validar(props.transaccionId, {
      aprobar: form.aprobar,
      motivoRechazo: form.aprobar ? undefined : form.motivoRechazo.trim(),
    })
    open.value = false
    emit('validado')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo registrar la validación'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="open"
    :title="titulo"
    confirm-label="Enviar validación"
    :variant="form.aprobar ? 'primary' : 'danger'"
    :loading="loading"
    @confirmar="confirmar"
  >
    <div class="flex flex-col gap-4">
      <!-- Comprobante reportado por la contraparte. -->
      <div v-if="voucher" class="rounded-base border border-border bg-surface-muted px-3 py-2 text-sm">
        <div class="mb-1 flex items-center gap-2">
          <BaseBadge variant="neutral">{{ voucher.tipo }}</BaseBadge>
          <span class="font-medium text-foreground">{{ voucher.nombreArchivo }}</span>
        </div>
        <p class="text-foreground-soft">
          Operación {{ voucher.numeroOperacion }} · Depósito del {{ formatFecha(voucher.fechaDeposito) }}
        </p>
        <a
          :href="urlArchivo(voucher.rutaArchivo)"
          target="_blank"
          rel="noopener"
          class="mt-1 inline-block text-brand-600 hover:underline"
        >
          Ver comprobante
        </a>
      </div>
      <p v-else class="text-sm text-foreground-soft">No se encontró el comprobante reportado.</p>

      <div class="flex flex-col gap-2">
        <label class="flex items-start gap-2" :class="!voucher && 'opacity-50'">
          <input v-model="form.aprobar" type="radio" :value="true" class="mt-1" :disabled="!voucher" />
          <span>
            <span class="font-medium text-foreground">Confirmar recepción</span>
            <span class="block text-xs text-foreground-soft">
              {{ tipo === 'Pago' ? 'El pago se recibió correctamente.' : 'La divisa se recibió correctamente.' }}
            </span>
          </span>
        </label>
        <label class="flex items-start gap-2">
          <input v-model="form.aprobar" type="radio" :value="false" class="mt-1" />
          <span>
            <span class="font-medium text-foreground">Rechazar</span>
            <span class="block text-xs text-foreground-soft">
              La transacción pasará a disputa para revisión del administrador.
            </span>
          </span>
        </label>
        <span v-if="errors.aprobar" class="text-xs text-danger">{{ errors.aprobar }}</span>
      </div>

      <BaseTextarea
        v-if="!form.aprobar"
        v-model="form.motivoRechazo"
        label="Motivo del rechazo"
        placeholder="Explica por qué rechazas el comprobante (mínimo 20 caracteres)"
        :rows="3"
        :error="errors.motivoRechazo"
        required
      />

      <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>
    </div>
  </BaseModal>
</template>
