<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseModal, BaseTextarea } from '@/components/ui'
import { adminService } from '../services/admin.service'

const props = defineProps<{
  usuarioId: number
  nombre: string
}>()

const emit = defineEmits<{ bloqueado: [] }>()
const open = defineModel<boolean>({ required: true })

const motivo = ref('')
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

watch(open, (abierto) => {
  if (abierto) {
    motivo.value = ''
    serverError.value = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }
})

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (motivo.value.trim().length < 30) errors.motivo = 'El motivo debe tener al menos 30 caracteres'
  return Object.keys(errors).length === 0
}

async function confirmar() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await adminService.bloquear(props.usuarioId, motivo.value.trim())
    open.value = false
    emit('bloqueado')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo bloquear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="open"
    title="Bloquear cuenta"
    confirm-label="Bloquear cuenta"
    variant="danger"
    :loading="loading"
    @confirmar="confirmar"
  >
    <div class="flex flex-col gap-4">
      <p>
        Vas a bloquear a <strong class="text-foreground">{{ nombre }}</strong>. No podrá iniciar
        sesión, publicar ofertas ni iniciar transacciones hasta que lo desbloquees.
      </p>

      <BaseTextarea
        v-model="motivo"
        label="Motivo del bloqueo"
        placeholder="Explica el motivo del bloqueo (mínimo 30 caracteres)"
        :rows="3"
        :error="errors.motivo"
        required
      />

      <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>
    </div>
  </BaseModal>
</template>
