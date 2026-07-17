<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseModal, BaseInput, BaseFileInput } from '@/components/ui'
import { rutaAdjunto } from '@/shared/utils/archivo'
import { transaccionesService } from '../services/transacciones.service'

const props = defineProps<{
  transaccionId: number
  codigo: string
  /** 'Pago' cuando el comprador reporta el pago, 'Entrega' cuando el vendedor reporta la entrega. */
  tipo: 'Pago' | 'Entrega'
}>()

const emit = defineEmits<{ reportado: [] }>()
const open = defineModel<boolean>({ required: true })

const form = reactive({ numeroOperacion: '', fechaDeposito: '' })
const archivos = ref<File[]>([])
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

// Cada vez que se abre el modal se limpia el formulario del reporte anterior.
watch(open, (abierto) => {
  if (abierto) {
    form.numeroOperacion = ''
    form.fechaDeposito = ''
    archivos.value = []
    serverError.value = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }
})

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.numeroOperacion.trim()) errors.numeroOperacion = 'Ingresa el número de operación'
  if (!form.fechaDeposito) {
    errors.fechaDeposito = 'Ingresa la fecha y hora del depósito'
  } else if (new Date(form.fechaDeposito).getTime() > Date.now()) {
    errors.fechaDeposito = 'La fecha del depósito no puede ser futura'
  }
  if (!archivos.value.length) errors.archivo = 'Adjunta el voucher del depósito'
  return Object.keys(errors).length === 0
}

async function confirmar() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    const archivo = archivos.value[0]
    await transaccionesService.reportar(props.transaccionId, {
      numeroOperacion: form.numeroOperacion.trim(),
      fechaDeposito: form.fechaDeposito,
      nombreArchivo: archivo.name,
      rutaArchivo: rutaAdjunto(`TXN-${props.transaccionId}`, archivo.name),
    })
    open.value = false
    emit('reportado')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo registrar el reporte'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="open"
    :title="tipo === 'Pago' ? 'Reportar pago' : 'Reportar entrega'"
    confirm-label="Enviar reporte"
    :loading="loading"
    @confirmar="confirmar"
  >
    <div class="flex flex-col gap-4">
      <p>
        Reporta el
        {{ tipo === 'Pago' ? 'pago realizado' : 'envío de la divisa' }}
        de la transacción <strong class="text-foreground">{{ codigo }}</strong> y adjunta el
        comprobante. La contraparte deberá validarlo para continuar.
      </p>

      <BaseInput
        v-model="form.numeroOperacion"
        label="Número de operación"
        placeholder="Ej. 000123456"
        :error="errors.numeroOperacion"
        required
      />

      <BaseInput
        v-model="form.fechaDeposito"
        label="Fecha y hora del depósito"
        type="datetime-local"
        :error="errors.fechaDeposito"
        required
      />

      <BaseFileInput v-model="archivos" label="Voucher" :max="1" :error="errors.archivo" required />

      <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>
    </div>
  </BaseModal>
</template>
