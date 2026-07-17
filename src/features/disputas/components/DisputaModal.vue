<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseModal, BaseTextarea, BaseFileInput } from '@/components/ui'
import { rutaAdjunto } from '@/shared/utils/archivo'
import { disputasService } from '../services/disputas.service'

const props = defineProps<{
  transaccionId: number
  codigo: string
}>()

const emit = defineEmits<{ abierta: [] }>()
const open = defineModel<boolean>({ required: true })

const motivo = ref('')
const evidencias = ref<File[]>([])
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

watch(open, (abierto) => {
  if (abierto) {
    motivo.value = ''
    evidencias.value = []
    serverError.value = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }
})

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (motivo.value.trim().length < 20) errors.motivo = 'El motivo debe tener al menos 20 caracteres'
  return Object.keys(errors).length === 0
}

async function confirmar() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await disputasService.crear({
      transaccionId: props.transaccionId,
      motivo: motivo.value.trim(),
      evidencias: evidencias.value.map((a) => rutaAdjunto(`disputa-TXN-${props.transaccionId}`, a.name)),
    })
    open.value = false
    emit('abierta')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo abrir la disputa'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="open"
    title="Abrir disputa"
    confirm-label="Abrir disputa"
    variant="danger"
    :loading="loading"
    @confirmar="confirmar"
  >
    <div class="flex flex-col gap-4">
      <p>
        Al abrir una disputa, la transacción
        <strong class="text-foreground">{{ codigo }}</strong> quedará congelada hasta que el
        administrador la resuelva. Solo puedes abrir una disputa por transacción.
      </p>

      <BaseTextarea
        v-model="motivo"
        label="Motivo de la disputa"
        placeholder="Describe el problema con la transacción (mínimo 20 caracteres)"
        :rows="4"
        :error="errors.motivo"
        required
      />

      <BaseFileInput v-model="evidencias" label="Evidencias (opcional, hasta 3)" :max="3" />

      <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>
    </div>
  </BaseModal>
</template>
